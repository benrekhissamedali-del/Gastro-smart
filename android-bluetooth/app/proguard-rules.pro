# Keep Bluetooth GATT callback classes from being stripped
-keep class com.gastrosmart.bluetooth.bluetooth.** { *; }
-keepclassmembers class * extends android.bluetooth.BluetoothGattCallback { *; }

# Kotlin coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembernames class kotlinx.** { volatile <fields>; }
