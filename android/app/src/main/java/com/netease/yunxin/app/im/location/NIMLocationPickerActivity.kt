package com.netease.yunxin.app.im.location

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.PackageManager.GET_META_DATA
import android.graphics.Color
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.netease.yunxin.app.im.R
import com.amap.api.location.AMapLocation
import com.amap.api.location.AMapLocationClient
import com.amap.api.location.AMapLocationClientOption
import com.amap.api.location.AMapLocationListener
import com.amap.api.maps.AMap
import com.amap.api.maps.AMapOptions
import com.amap.api.maps.CameraUpdateFactory
import com.amap.api.maps.LocationSource
import com.amap.api.maps.MapsInitializer
import com.amap.api.maps.MapView
import com.amap.api.maps.model.BitmapDescriptorFactory
import com.amap.api.maps.model.LatLng
import com.amap.api.maps.model.MyLocationStyle
import com.amap.api.services.core.AMapException
import com.amap.api.services.core.LatLonPoint
import com.amap.api.services.core.ServiceSettings
import com.amap.api.services.core.PoiItem
import com.amap.api.services.poisearch.PoiResult
import com.amap.api.services.poisearch.PoiSearch
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Locale
import kotlin.math.ceil
import org.json.JSONObject

data class NIMLocationPoi(
  val title: String,
  val address: String,
  val city: String?,
  val latitude: Double,
  val longitude: Double,
  val distance: Int?,
  var selected: Boolean = false
)

class NIMLocationPickerActivity :
  AppCompatActivity(),
  LocationSource,
  AMapLocationListener,
  PoiSearch.OnPoiSearchListener {
  private lateinit var mapView: MapView
  private lateinit var map: AMap
  private lateinit var searchInput: EditText
  private lateinit var adapter: LocationPoiAdapter
  private lateinit var emptyView: TextView
  private lateinit var loadingView: ProgressBar
  private lateinit var sendButton: TextView
  private lateinit var locateButton: TextView
  private var selectedPoi: NIMLocationPoi? = null
  private var currentPoi: NIMLocationPoi? = null
  private var locationClient: AMapLocationClient? = null
  private var locationChangedListener: LocationSource.OnLocationChangedListener? = null
  private var lastSearchToken = ""
  private var lastSearchKeyword = ""
  private var lastSearchCenter: LatLonPoint? = null
  private var systemLocationListener: LocationListener? = null
  private var pendingLocationFailureMessage: String? = null
  private var amapWebApiKey: String? = null
  private var suppressNextCameraSearch = false
  private var ignoreNextSearchTextChange = false
  private val searchHandler = Handler(Looper.getMainLooper())
  private val requestPermission =
    registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
      val granted =
        result[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
          result[Manifest.permission.ACCESS_COARSE_LOCATION] == true

      if (granted) {
        startLocation()
      } else {
        Toast.makeText(this, "请开启定位权限，或搜索地点选择位置", Toast.LENGTH_LONG).show()
        searchPoi("", null)
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.i(TAG, "NIMLocationPickerActivity onCreate")
    updateAmapPrivacy()
    setContentView(createContentView(savedInstanceState))
    map = mapView.map
    configureMap()
    requestLocationPermission()
  }

  override fun onResume() {
    super.onResume()
    mapView.onResume()
  }

  override fun onPause() {
    mapView.onPause()
    super.onPause()
  }

  override fun onDestroy() {
    searchHandler.removeCallbacksAndMessages(null)
    stopSystemLocationFallback()
    releaseLocationClient()
    mapView.onDestroy()
    super.onDestroy()
  }

  override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    mapView.onSaveInstanceState(outState)
  }

  override fun onLocationChanged(location: AMapLocation?) {
    if (location == null || location.errorCode != 0) {
      Log.w(
        TAG,
        "location failed, code=${location?.errorCode}, info=${location?.errorInfo}, detail=${location?.locationDetail}"
      )
      pendingLocationFailureMessage = buildLocationFailureMessage(location)
      startSystemLocationFallback()
      return
    }

    pendingLocationFailureMessage = null
    Log.i(TAG, "location success: ${location.toStr()}")
    locationChangedListener?.onLocationChanged(location)
    currentPoi =
      NIMLocationPoi(
        title = location.poiName ?: location.address ?: "当前位置",
        address = location.address ?: "",
        city = location.city,
        latitude = location.latitude,
        longitude = location.longitude,
        distance = 0,
        selected = true
      )
    suppressNextCameraSearch = true
    map.animateCamera(CameraUpdateFactory.newLatLngZoom(LatLng(location.latitude, location.longitude), 17f))
    searchPoi("", LatLonPoint(location.latitude, location.longitude))
  }

  override fun onPoiSearched(result: PoiResult?, code: Int) {
    loadingView.visibility = View.GONE
    val poiQuery = result?.query
    val resultToken = poiQuery?.extensions.orEmpty()
    Log.i(
      TAG,
      "poi searched, code=$code, query=${poiQuery?.queryString}, city=${poiQuery?.city}, extensions=${poiQuery?.extensions}, count=${result?.pois?.size ?: 0}"
    )
    if (resultToken.isNotEmpty() && resultToken != lastSearchToken) {
      Log.i(TAG, "ignore stale poi result, token=$resultToken, latest=$lastSearchToken")
      return
    }
    if (code != AMapException.CODE_AMAP_SUCCESS || result?.pois == null) {
      Log.w(TAG, "poi search failed, code=$code, result=$result")
      searchPoiViaRest(lastSearchKeyword, lastSearchCenter)
      return
    }

    val list = result.pois.mapNotNull { item -> item.toLocationPoi() }
    val query = result.query?.queryString.orEmpty()
    showResults(buildDisplayResults(list, query, lastSearchCenter))
  }

  override fun onPoiItemSearched(item: PoiItem?, code: Int) = Unit

  private fun createContentView(savedInstanceState: Bundle?): View {
    val root = FrameLayout(this)
    val mapContainer = FrameLayout(this)
    mapView = MapView(this)
    mapView.onCreate(savedInstanceState)
    mapContainer.addView(
      mapView,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )
    mapContainer.addView(
      ImageView(this).apply {
        setImageResource(R.drawable.ic_location_marker)
        isClickable = false
        isFocusable = false
        translationY = -dp(18).toFloat()
      },
      FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.CENTER)
    )
    root.addView(
      mapContainer,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      ).apply { bottomMargin = dp(268) }
    )

    val topBar =
      LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(16), dp(42), dp(16), dp(12))
        setBackgroundColor(Color.parseColor("#33000000"))
      }

    val cancelButton = headerButton("取消")
    cancelButton.setOnClickListener { cancelPicker() }
    sendButton = headerButton("发送").apply {
      setTextColor(Color.WHITE)
      setBackgroundColor(Color.parseColor("#337EFF"))
      isEnabled = false
      alpha = 0.58f
      setOnClickListener { sendSelectedLocation() }
    }

    topBar.addView(cancelButton)
    topBar.addView(View(this), LinearLayout.LayoutParams(0, 1, 1f))
    topBar.addView(sendButton, LinearLayout.LayoutParams(dp(64), dp(32)))
    root.addView(
      topBar,
      FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(108), Gravity.TOP)
    )

    locateButton =
      TextView(this).apply {
        text = "⌖"
        textSize = 22f
        gravity = Gravity.CENTER
        setTextColor(Color.parseColor("#337EFF"))
        setBackgroundColor(Color.WHITE)
        setOnClickListener {
          searchHandler.removeCallbacksAndMessages(null)
          clearSearchInputSilently()
          startLocation()
        }
      }
    root.addView(
      locateButton,
      FrameLayout.LayoutParams(dp(40), dp(40), Gravity.END or Gravity.BOTTOM).apply {
        marginEnd = dp(12)
        bottomMargin = dp(288)
      }
    )

    val bottomPanel =
      LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setBackgroundColor(Color.WHITE)
      }
    val searchRow =
      LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(12), dp(10), dp(12), dp(10))
      }
    searchInput =
      EditText(this).apply {
        hint = "搜索地点"
        textSize = 14f
        setSingleLine(true)
        setPadding(dp(14), 0, dp(14), 0)
        setBackgroundColor(Color.parseColor("#F2F4F7"))
      }
    val searchCancel = TextView(this).apply {
      text = "取消"
      textSize = 14f
      gravity = Gravity.CENTER
      setTextColor(Color.parseColor("#666666"))
      setOnClickListener {
        searchHandler.removeCallbacksAndMessages(null)
        clearSearchInputSilently()
        hideKeyboard()
        currentPoi?.let {
          suppressNextCameraSearch = true
          map.animateCamera(CameraUpdateFactory.newLatLngZoom(LatLng(it.latitude, it.longitude), 17f))
          searchPoi("", LatLonPoint(it.latitude, it.longitude))
        }
      }
    }
    searchRow.addView(searchInput, LinearLayout.LayoutParams(0, dp(36), 1f))
    searchRow.addView(searchCancel, LinearLayout.LayoutParams(dp(54), dp(36)))
    bottomPanel.addView(searchRow)

    adapter =
      LocationPoiAdapter { poi ->
        selectPoi(poi, true)
      }
    val recyclerView =
      RecyclerView(this).apply {
        layoutManager = LinearLayoutManager(this@NIMLocationPickerActivity)
        adapter = this@NIMLocationPickerActivity.adapter
      }
    emptyView =
      TextView(this).apply {
        text = "暂无位置"
        gravity = Gravity.CENTER
        setTextColor(Color.parseColor("#B3B7BC"))
        visibility = View.GONE
      }
    loadingView = ProgressBar(this).apply { visibility = View.GONE }
    val listFrame = FrameLayout(this)
    listFrame.addView(recyclerView)
    listFrame.addView(emptyView, FrameLayout.LayoutParams(-1, -1))
    listFrame.addView(loadingView, FrameLayout.LayoutParams(dp(40), dp(40), Gravity.CENTER))
    bottomPanel.addView(listFrame, LinearLayout.LayoutParams(-1, dp(212)))
    root.addView(
      bottomPanel,
      FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(268), Gravity.BOTTOM)
    )

    searchInput.addTextChangedListener(
      object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = Unit
        override fun afterTextChanged(s: Editable?) {
          if (ignoreNextSearchTextChange) {
            ignoreNextSearchTextChange = false
            return
          }
          searchHandler.removeCallbacksAndMessages(null)
          searchHandler.postDelayed(
            {
              val keyword = s?.toString().orEmpty()
              searchPoi(keyword, if (keyword.isBlank()) currentMapCenterPoint() else null)
            },
            500
          )
        }
      }
    )

    return root
  }

  private fun configureMap() {
    map.uiSettings.setZoomControlsEnabled(false)
    map.uiSettings.logoPosition = AMapOptions.LOGO_POSITION_BOTTOM_RIGHT
    map.myLocationStyle =
      MyLocationStyle().apply {
        myLocationType(MyLocationStyle.LOCATION_TYPE_LOCATE)
        myLocationIcon(BitmapDescriptorFactory.fromResource(R.drawable.ic_my_location_in))
        anchor(0.5f, 0.5f)
        showMyLocation(true)
      }
    map.setLocationSource(this)
    map.isMyLocationEnabled = true
    map.moveCamera(CameraUpdateFactory.zoomTo(17f))
    map.setOnCameraChangeListener(
      object : AMap.OnCameraChangeListener {
        override fun onCameraChange(position: com.amap.api.maps.model.CameraPosition?) = Unit

        override fun onCameraChangeFinish(position: com.amap.api.maps.model.CameraPosition?) {
          if (suppressNextCameraSearch) {
            suppressNextCameraSearch = false
            return
          }
          if (position == null || searchInput.text.toString().trim().isNotEmpty()) {
            return
          }

          searchPoi("", LatLonPoint(position.target.latitude, position.target.longitude))
        }
      }
    )
  }

  private fun updateAmapPrivacy() {
    val amapApiKey = getManifestMetaData("com.amap.api.v2.apikey")
    amapWebApiKey = getManifestMetaData("com.amap.api.v2.web.apikey")
    AMapLocationClient.updatePrivacyShow(this, true, true)
    AMapLocationClient.updatePrivacyAgree(this, true)
    MapsInitializer.updatePrivacyShow(this, true, true)
    MapsInitializer.updatePrivacyAgree(this, true)
    ServiceSettings.updatePrivacyShow(this, true, true)
    ServiceSettings.updatePrivacyAgree(this, true)
    if (!amapApiKey.isNullOrBlank()) {
      AMapLocationClient.setApiKey(amapApiKey)
      MapsInitializer.setApiKey(amapApiKey)
      ServiceSettings.getInstance().setApiKey(amapApiKey)
    } else {
      Log.w(TAG, "AMap native api key missing from manifest meta-data")
    }
    ServiceSettings.getInstance().setProtocol(ServiceSettings.HTTPS)
    if (!amapWebApiKey.isNullOrBlank()) {
      Log.i(TAG, "AMap initialized with manifest keys")
    } else {
      Log.w(TAG, "AMap web api key missing from manifest meta-data")
    }
  }

  private fun requestLocationPermission() {
    val fineGranted =
      ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) ==
        PackageManager.PERMISSION_GRANTED
    val coarseGranted =
      ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) ==
        PackageManager.PERMISSION_GRANTED

    if (fineGranted || coarseGranted) {
      activateLocationLayer()
      return
    }

    requestPermission.launch(
      arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
    )
  }

  private fun startLocation() {
    Log.i(TAG, "startLocation")
    loadingView.visibility = View.VISIBLE
    if (locationClient == null) {
      try {
        locationClient = AMapLocationClient(applicationContext).apply {
          setLocationListener(this@NIMLocationPickerActivity)
          setLocationOption(
            AMapLocationClientOption().apply {
              locationMode = AMapLocationClientOption.AMapLocationMode.Hight_Accuracy
              isOnceLocation = true
            }
          )
        }
      } catch (exception: Exception) {
        Log.e(TAG, "create location client failed", exception)
        loadingView.visibility = View.GONE
        Toast.makeText(this, "定位初始化失败，可搜索地点选择位置", Toast.LENGTH_SHORT).show()
        return
      }
    }
    locationClient?.startLocation()
  }

  override fun activate(listener: LocationSource.OnLocationChangedListener?) {
    Log.i(TAG, "LocationSource activate")
    locationChangedListener = listener
    startLocation()
  }

  override fun deactivate() {
    Log.i(TAG, "LocationSource deactivate")
    locationChangedListener = null
    releaseLocationClient()
  }

  private fun activateLocationLayer() {
    try {
      map.isMyLocationEnabled = false
      map.isMyLocationEnabled = true
    } catch (exception: Exception) {
      Log.e(TAG, "activate location layer failed", exception)
      startLocation()
    }
  }

  private fun releaseLocationClient() {
    locationClient?.stopLocation()
    locationClient?.onDestroy()
    locationClient = null
  }

  private fun startSystemLocationFallback() {
    if (!hasLocationPermission()) {
      searchPoi("", null)
      return
    }

    val locationManager = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
    if (locationManager == null) {
      searchPoi("", null)
      return
    }

    try {
      val lastLocation =
        listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
          .mapNotNull { provider -> runCatching { locationManager.getLastKnownLocation(provider) }.getOrNull() }
          .maxByOrNull { it.time }

      if (lastLocation != null) {
        onSystemLocationChanged(lastLocation)
        return
      }

      stopSystemLocationFallback()
      val provider =
        when {
          locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
          locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
          else -> null
        }

      if (provider == null) {
        loadingView.visibility = View.GONE
        showLocationFailureToast("系统定位未开启，可搜索地点选择位置")
        searchPoi("", null)
        return
      }

      val listener =
        object : LocationListener {
          override fun onLocationChanged(location: Location) {
            stopSystemLocationFallback()
            onSystemLocationChanged(location)
          }

          override fun onProviderDisabled(provider: String) = Unit
          override fun onProviderEnabled(provider: String) = Unit
          override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) = Unit
        }

      systemLocationListener = listener
      locationManager.requestSingleUpdate(provider, listener, Looper.getMainLooper())
      searchHandler.postDelayed(
        {
          if (systemLocationListener != null) {
            stopSystemLocationFallback()
            loadingView.visibility = View.GONE
            showLocationFailureToast("定位超时，可搜索地点选择位置")
            searchPoi("", null)
          }
        },
        8000
      )
    } catch (exception: SecurityException) {
      Log.e(TAG, "system location permission denied", exception)
      loadingView.visibility = View.GONE
      showLocationFailureToast("请开启定位权限，或搜索地点选择位置")
      searchPoi("", null)
    } catch (exception: Exception) {
      Log.e(TAG, "system location fallback failed", exception)
      loadingView.visibility = View.GONE
      showLocationFailureToast("定位失败，可搜索地点选择位置")
      searchPoi("", null)
    }
  }

  private fun stopSystemLocationFallback() {
    val listener = systemLocationListener ?: return
    (getSystemService(Context.LOCATION_SERVICE) as? LocationManager)?.removeUpdates(listener)
    systemLocationListener = null
  }

  private fun onSystemLocationChanged(location: Location) {
    pendingLocationFailureMessage = null
    Log.i(TAG, "system location success: ${location.latitude},${location.longitude}")
    currentPoi =
      NIMLocationPoi(
        title = "当前位置",
        address = "",
        city = null,
        latitude = location.latitude,
        longitude = location.longitude,
        distance = 0,
        selected = true
      )
    locationChangedListener?.onLocationChanged(
      AMapLocation(LocationManager.NETWORK_PROVIDER).apply {
        latitude = location.latitude
        longitude = location.longitude
        accuracy = location.accuracy
      }
    )
    suppressNextCameraSearch = true
    map.animateCamera(CameraUpdateFactory.newLatLngZoom(LatLng(location.latitude, location.longitude), 17f))
    searchPoi("", LatLonPoint(location.latitude, location.longitude))
  }

  private fun hasLocationPermission(): Boolean =
    ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) ==
      PackageManager.PERMISSION_GRANTED ||
      ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) ==
      PackageManager.PERMISSION_GRANTED

  private fun searchPoi(keyword: String, center: LatLonPoint?) {
    val trimmedKeyword = keyword.trim()
    val effectiveCenter =
      center ?: if (trimmedKeyword.isEmpty() && (currentPoi != null || lastSearchCenter != null)) currentMapCenterPoint() else null
    if (trimmedKeyword.isEmpty() && effectiveCenter == null) {
      Log.i(TAG, "skip empty poi search without center")
      lastSearchToken = System.nanoTime().toString()
      loadingView.visibility = View.GONE
      showResults(buildDisplayResults(emptyList(), trimmedKeyword, null))
      return
    }

    val token = System.nanoTime().toString()
    lastSearchToken = token
    lastSearchKeyword = trimmedKeyword
    lastSearchCenter = effectiveCenter
    loadingView.visibility = View.VISIBLE
    val city = currentPoi?.city.orEmpty()
    Log.i(
      TAG,
      "searchPoi keyword=$keyword, city=$city, center=${effectiveCenter?.latitude},${effectiveCenter?.longitude}, token=$token"
    )
    val query =
      PoiSearch.Query(trimmedKeyword, "", city).apply {
        pageSize = 10
        pageNum = 0
        cityLimit = false
        extensions = token
        requireSubPois(true)
      }
    try {
      val search = PoiSearch(this, query)
      search.setOnPoiSearchListener(this)
      if (effectiveCenter != null && trimmedKeyword.isEmpty()) {
        search.bound = PoiSearch.SearchBound(effectiveCenter, 5000)
      }
      search.searchPOIAsyn()
    } catch (exception: AMapException) {
      Log.e(TAG, "poi search exception, code=${exception.errorCode}", exception)
      loadingView.visibility = View.GONE
      showResults(buildDisplayResults(emptyList(), trimmedKeyword, effectiveCenter))
    } catch (exception: Exception) {
      Log.e(TAG, "poi search exception", exception)
      loadingView.visibility = View.GONE
      showResults(buildDisplayResults(emptyList(), trimmedKeyword, effectiveCenter))
    }
  }

  private fun searchPoiViaRest(keyword: String, center: LatLonPoint?) {
    val token = System.nanoTime().toString()
    lastSearchToken = token
    loadingView.visibility = View.VISIBLE
    Thread {
      val result =
        runCatching {
          if (keyword.isBlank() && center != null) {
            requestAroundPois(center)
          } else if (keyword.isNotBlank()) {
            requestTextPois(keyword, center)
          } else {
            emptyList()
          }
        }.onFailure { Log.e(TAG, "rest poi search failed", it) }.getOrDefault(emptyList())

      searchHandler.post {
        if (lastSearchToken != token) {
          return@post
        }
        loadingView.visibility = View.GONE
        val list = buildDisplayResults(result, keyword, center)
        Log.i(TAG, "rest poi searched, keyword=$keyword, count=${list.size}")
        showResults(list)
      }
    }.start()
  }

  private fun requestAroundPois(center: LatLonPoint): List<NIMLocationPoi> {
    val webApiKey = amapWebApiKey.orEmpty()
    if (webApiKey.isBlank()) {
      Log.w(TAG, "skip around rest poi request because web api key is missing")
      return emptyList()
    }
    val url =
      "https://restapi.amap.com/v3/place/around?" +
        listOf(
          "key=${encode(webApiKey)}",
          "location=${center.longitude},${center.latitude}",
          "radius=5000",
          "offset=10",
          "page=1",
          "extensions=base"
        ).joinToString("&")
    return parseRestPois(fetchText(url))
  }

  private fun requestTextPois(keyword: String, center: LatLonPoint?): List<NIMLocationPoi> {
    val webApiKey = amapWebApiKey.orEmpty()
    if (webApiKey.isBlank()) {
      Log.w(TAG, "skip text rest poi request because web api key is missing")
      return emptyList()
    }
    val params =
      mutableListOf(
        "key=${encode(webApiKey)}",
        "keywords=${encode(keyword)}",
        "offset=10",
        "page=1",
        "extensions=base"
      )
    if (center != null) {
      params.add("location=${center.longitude},${center.latitude}")
      params.add("citylimit=false")
    }
    return parseRestPois(fetchText("https://restapi.amap.com/v3/place/text?${params.joinToString("&")}"))
  }

  private fun fetchText(url: String): String {
    val connection = URL(url).openConnection() as HttpURLConnection
    connection.connectTimeout = 5000
    connection.readTimeout = 5000
    connection.requestMethod = "GET"
    return connection.inputStream.bufferedReader().use { it.readText() }
  }

  private fun parseRestPois(body: String): List<NIMLocationPoi> {
    val json = JSONObject(body)
    if (json.optString("status") != "1") {
      Log.w(TAG, "rest poi search error: ${json.optString("infocode")} ${json.optString("info")}")
      return emptyList()
    }
    val pois = json.optJSONArray("pois") ?: return emptyList()
    return (0 until pois.length()).mapNotNull { index ->
      val poi = pois.optJSONObject(index) ?: return@mapNotNull null
      val parts = poi.optString("location").split(",")
      if (parts.size != 2) {
        return@mapNotNull null
      }
      val longitude = parts[0].toDoubleOrNull() ?: return@mapNotNull null
      val latitude = parts[1].toDoubleOrNull() ?: return@mapNotNull null
      NIMLocationPoi(
        title = poi.optString("name"),
        address = poi.optString("address"),
        city = poi.optString("cityname"),
        latitude = latitude,
        longitude = longitude,
        distance = poi.optString("distance").toIntOrNull(),
        selected = false
      )
    }
  }

  private fun encode(value: String): String = URLEncoder.encode(value, "UTF-8")

  private fun showLocationFailureToast(fallbackMessage: String) {
    val message = pendingLocationFailureMessage ?: fallbackMessage
    pendingLocationFailureMessage = null
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
  }

  private fun buildLocationFailureMessage(location: AMapLocation?): String {
    val code = location?.errorCode
    val info = location?.errorInfo.orEmpty()
    return if (code == null) {
      "定位失败，可搜索地点选择位置"
    } else {
      "定位失败（$code${if (info.isNotBlank()) " $info" else ""}），可搜索地点选择位置"
    }
  }

  private fun getManifestMetaData(name: String): String? =
    runCatching {
        packageManager
          .getApplicationInfo(packageName, GET_META_DATA)
          .metaData
          ?.getString(name)
          ?.trim()
          ?.takeIf { it.isNotEmpty() }
      }
      .onFailure { Log.e(TAG, "read manifest meta-data failed: $name", it) }
      .getOrNull()

  private fun buildDisplayResults(
    items: List<NIMLocationPoi>,
    keyword: String,
    center: LatLonPoint?
  ): List<NIMLocationPoi> {
    val normalized = items.map { it.copy(selected = false) }.toMutableList()
    val current = currentPoi
    if (keyword.isBlank() && current != null && center != null && current.isSameLatLng(center.latitude, center.longitude)) {
      return buildList {
        add(current.copy(selected = true))
        addAll(normalized)
      }
    }
    if (normalized.isNotEmpty()) {
      normalized[0] = normalized[0].copy(selected = true)
      return normalized
    }
    if (keyword.isBlank() && center != null) {
      return listOf(buildCoordinatePoi(center))
    }
    return emptyList()
  }

  private fun buildCoordinatePoi(center: LatLonPoint): NIMLocationPoi =
    NIMLocationPoi(
      title = "所选位置",
      address = "纬度 ${center.latitude.toCoordinateText()}，经度 ${center.longitude.toCoordinateText()}",
      city = currentPoi?.city,
      latitude = center.latitude,
      longitude = center.longitude,
      distance = null,
      selected = true
    )

  private fun showResults(items: List<NIMLocationPoi>) {
    val token = lastSearchToken
    if (token.isEmpty()) {
      return
    }
    adapter.submit(items)
    emptyView.visibility = if (items.isEmpty()) View.VISIBLE else View.GONE
    selectedPoi = items.firstOrNull { it.selected } ?: items.firstOrNull()
    updateSendState()
  }

  private fun selectPoi(poi: NIMLocationPoi, moveMap: Boolean) {
    selectedPoi = poi
    adapter.select(poi)
    updateSendState()
    if (moveMap) {
      suppressNextCameraSearch = true
      map.animateCamera(CameraUpdateFactory.newLatLngZoom(LatLng(poi.latitude, poi.longitude), 17f))
    }
  }

  private fun updateSendState() {
    val enabled = selectedPoi != null
    sendButton.isEnabled = enabled
    sendButton.alpha = if (enabled) 1f else 0.58f
  }

  private fun sendSelectedLocation() {
    val poi = selectedPoi
    if (poi == null) {
      Toast.makeText(this, "请选择一个位置", Toast.LENGTH_SHORT).show()
      return
    }

    setResult(
      Activity.RESULT_OK,
      Intent().apply {
        putExtra(EXTRA_TITLE, poi.title)
        putExtra(EXTRA_ADDRESS, poi.address)
        putExtra(EXTRA_LATITUDE, poi.latitude)
        putExtra(EXTRA_LONGITUDE, poi.longitude)
      }
    )
    finish()
  }

  private fun cancelPicker() {
    setResult(Activity.RESULT_CANCELED)
    finish()
  }

  private fun PoiItem.toLocationPoi(): NIMLocationPoi? {
    val point = latLonPoint ?: return null
    return NIMLocationPoi(
      title = title.orEmpty(),
      address = snippet.orEmpty(),
      city = cityName,
      latitude = point.latitude,
      longitude = point.longitude,
      distance = if (distance > 0) distance else null
    )
  }

  private fun NIMLocationPoi.isSameLatLng(latitude: Double, longitude: Double): Boolean =
    this.latitude == latitude && this.longitude == longitude

  private fun Double.toCoordinateText(): String = String.format(Locale.US, "%.6f", this)

  private fun currentMapCenterPoint(): LatLonPoint? =
    map.cameraPosition?.target?.let { target -> LatLonPoint(target.latitude, target.longitude) }

  private fun headerButton(label: String): TextView =
    TextView(this).apply {
      text = label
      textSize = 16f
      gravity = Gravity.CENTER
      setTextColor(Color.WHITE)
    }

  private fun hideKeyboard() {
    (getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)?.hideSoftInputFromWindow(
      searchInput.windowToken,
      0
    )
    searchInput.clearFocus()
  }

  private fun clearSearchInputSilently() {
    if (searchInput.text.isNullOrEmpty()) {
      ignoreNextSearchTextChange = false
      return
    }
    ignoreNextSearchTextChange = true
    searchInput.setText("")
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

  companion object {
    private const val TAG = "NIMLocationPicker"
    const val EXTRA_TITLE = "title"
    const val EXTRA_ADDRESS = "address"
    const val EXTRA_LATITUDE = "latitude"
    const val EXTRA_LONGITUDE = "longitude"
  }
}

class LocationPoiAdapter(
  private val onSelected: (NIMLocationPoi) -> Unit
) : RecyclerView.Adapter<LocationPoiViewHolder>() {
  private val items = mutableListOf<NIMLocationPoi>()
  private var selectedIndex = -1

  fun submit(nextItems: List<NIMLocationPoi>) {
    items.clear()
    if (nextItems.isEmpty()) {
      selectedIndex = -1
      notifyDataSetChanged()
      return
    }
    val nextSelectedIndex = nextItems.indexOfFirst { it.selected }.takeIf { it >= 0 } ?: 0
    items.addAll(nextItems.mapIndexed { index, item -> item.copy(selected = index == nextSelectedIndex) })
    selectedIndex = nextSelectedIndex
    notifyDataSetChanged()
  }

  fun select(poi: NIMLocationPoi) {
    val nextIndex = items.indexOfFirst {
      it.latitude == poi.latitude && it.longitude == poi.longitude && it.title == poi.title
    }
    if (nextIndex < 0) {
      return
    }

    val oldIndex = selectedIndex
    if (oldIndex in items.indices) {
      items[oldIndex] = items[oldIndex].copy(selected = false)
    }
    items[nextIndex] = items[nextIndex].copy(selected = true)
    selectedIndex = nextIndex
    if (oldIndex in items.indices && oldIndex != nextIndex) {
      notifyItemChanged(oldIndex)
    }
    notifyItemChanged(nextIndex)
  }

  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LocationPoiViewHolder {
    val row =
      LinearLayout(parent.context).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(parent.context, 16), 0, dp(parent.context, 16), 0)
        layoutParams = RecyclerView.LayoutParams(-1, dp(parent.context, 64))
      }
    val textWrap = LinearLayout(parent.context).apply { orientation = LinearLayout.VERTICAL }
    val title = TextView(parent.context).apply {
      textSize = 16f
      setTextColor(Color.parseColor("#333333"))
      maxLines = 1
    }
    val address = TextView(parent.context).apply {
      textSize = 13f
      setTextColor(Color.parseColor("#999999"))
      maxLines = 1
    }
    val selected = TextView(parent.context).apply {
      text = "✓"
      textSize = 16f
      gravity = Gravity.CENTER
      setTextColor(Color.parseColor("#337EFF"))
    }
    textWrap.addView(title)
    textWrap.addView(address)
    row.addView(textWrap, LinearLayout.LayoutParams(0, -2, 1f))
    row.addView(selected, LinearLayout.LayoutParams(dp(parent.context, 24), dp(parent.context, 24)))
    return LocationPoiViewHolder(row, title, address, selected)
  }

  override fun getItemCount(): Int = items.size

  override fun onBindViewHolder(holder: LocationPoiViewHolder, position: Int) {
    val item = items[position]
    holder.title.text = item.title
    holder.address.text =
      listOfNotNull(
        item.distance?.takeIf { it > 0 }?.let { "${ceil(it.toDouble()).toInt()}m" },
        item.address
      ).joinToString(" | ")
    holder.selected.visibility = if (item.selected) View.VISIBLE else View.INVISIBLE
    holder.itemView.setOnClickListener { onSelected(item) }
  }

  private fun dp(context: Context, value: Int): Int =
    (value * context.resources.displayMetrics.density).toInt()
}

class LocationPoiViewHolder(
  itemView: View,
  val title: TextView,
  val address: TextView,
  val selected: TextView
) : RecyclerView.ViewHolder(itemView)
