package com.gastrosmart.bluetooth.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary          = BluetoothBlue,
    onPrimary        = OnSurface,
    primaryContainer = BluetoothBlueDark,
    secondary        = Teal,
    background       = SurfaceDark,
    surface          = SurfaceDark,
    surfaceVariant   = SurfaceVariant,
    onBackground     = OnSurface,
    onSurface        = OnSurface,
    error            = ErrorRed,
)

private val LightColorScheme = lightColorScheme(
    primary          = BluetoothBlue,
    onPrimary        = OnSurface,
    primaryContainer = BluetoothBlueDark,
    secondary        = Teal,
)

@Composable
fun GastroSmartBluetoothTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val ctx = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
        }
        darkTheme -> DarkColorScheme
        else      -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = AppTypography,
        content     = content,
    )
}
