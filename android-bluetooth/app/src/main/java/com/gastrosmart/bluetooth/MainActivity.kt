package com.gastrosmart.bluetooth

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.gastrosmart.bluetooth.ui.screens.DeviceControlScreen
import com.gastrosmart.bluetooth.ui.screens.ScanScreen
import com.gastrosmart.bluetooth.ui.theme.GastroSmartBluetoothTheme
import com.gastrosmart.bluetooth.viewmodel.BluetoothViewModel

private const val ROUTE_SCAN    = "scan"
private const val ROUTE_CONTROL = "control"

class MainActivity : ComponentActivity() {

    private val viewModel: BluetoothViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            GastroSmartBluetoothTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color    = MaterialTheme.colorScheme.background,
                ) {
                    val navController = rememberNavController()

                    NavHost(
                        navController    = navController,
                        startDestination = ROUTE_SCAN,
                    ) {
                        composable(ROUTE_SCAN) {
                            ScanScreen(
                                viewModel        = viewModel,
                                onDeviceSelected = { navController.navigate(ROUTE_CONTROL) },
                            )
                        }
                        composable(ROUTE_CONTROL) {
                            DeviceControlScreen(
                                viewModel = viewModel,
                                onBack    = { navController.popBackStack() },
                            )
                        }
                    }
                }
            }
        }
    }

    /**
     * Re-check Bluetooth state when the user returns from system settings.
     * This triggers a recomposition via StateFlow in BluetoothViewModel.
     */
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        @Suppress("DEPRECATION")
        super.onActivityResult(requestCode, resultCode, data)
    }
}
