package com.aivevia.petali;

import android.util.Log;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * PETALI Android: acquisti una tantum gestiti dal Google Play Store.
 * Nessuna chiave RevenueCat su Android. Non concede diritti a pagamenti PENDING.
 * I prodotti non vengono mai consumati: gli sblocchi sono permanenti.
 */
@CapacitorPlugin(name = "PetaliBilling")
public class PetaliBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String TAG = "PetaliBilling";
    private static final String TWO_D = "fiori_2d";
    private static final String THREE_D = "fiori_3d";
    private BillingClient client;
    private boolean connecting = false;
    private final List<PluginCall> waitingCalls = new ArrayList<>();
    private final List<Runnable> waitingActions = new ArrayList<>();
    private PluginCall activePurchase;
    private String activeProductId;

    @Override
    public void load() {
        client = BillingClient.newBuilder(getContext())
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .enableAutoServiceReconnection()
                .build();
    }

    private void connected(PluginCall call, Runnable action) {
        getActivity().runOnUiThread(() -> {
            if (client == null) {
                call.reject("Google Play Billing non inizializzato");
                return;
            }
            if (client.isReady()) {
                action.run();
                return;
            }
            waitingCalls.add(call);
            waitingActions.add(action);
            if (connecting) return;
            connecting = true;
            client.startConnection(new BillingClientStateListener() {
                @Override
                public void onBillingSetupFinished(BillingResult result) {
                    getActivity().runOnUiThread(() -> {
                        connecting = false;
                        List<PluginCall> calls = new ArrayList<>(waitingCalls);
                        List<Runnable> actions = new ArrayList<>(waitingActions);
                        waitingCalls.clear();
                        waitingActions.clear();
                        for (int i = 0; i < calls.size(); i++) {
                            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                                actions.get(i).run();
                            } else {
                                calls.get(i).reject("Google Play non disponibile: " + result.getDebugMessage());
                            }
                        }
                    });
                }

                @Override
                public void onBillingServiceDisconnected() {
                    // La connessione automatica riproverà alle richieste successive.
                    connecting = false;
                }
            });
        });
    }

    @PluginMethod
    public void getPurchases(PluginCall call) {
        connected(call, () -> queryOwned(call));
    }

    private void acknowledge(Purchase purchase) {
        if (purchase.isAcknowledged() || purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return;
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.getPurchaseToken()).build();
        client.acknowledgePurchase(params, result -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                Log.w(TAG, "Impossibile confermare l'acquisto: " + result.getDebugMessage());
            }
        });
    }

    private void queryOwned(PluginCall call) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP).build();
        client.queryPurchasesAsync(params, (result, purchases) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                call.reject("Impossibile verificare gli acquisti Google Play: " + result.getDebugMessage());
                return;
            }
            JSArray purchased = new JSArray();
            for (Purchase purchase : purchases) {
                if (purchase.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
                acknowledge(purchase);
                for (String product : purchase.getProducts()) {
                    if (!purchased.toString().contains("\"" + product + "\"")) purchased.put(product);
                }
            }
            call.resolve(new JSObject().put("purchased", purchased));
        });
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId", "");
        if (!TWO_D.equals(productId) && !THREE_D.equals(productId)) {
            call.reject("Prodotto Google Play non autorizzato");
            return;
        }
        connected(call, () -> beginPurchase(call, productId));
    }

    private void beginPurchase(PluginCall call, String productId) {
        if (activePurchase != null) {
            call.reject("Un acquisto è già in corso");
            return;
        }
        QueryProductDetailsParams.Product item = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId).setProductType(BillingClient.ProductType.INAPP).build();
        QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(item)).build();
        client.queryProductDetailsAsync(params, (result, detailsResult) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK ||
                    detailsResult.getProductDetailsList().isEmpty()) {
                call.reject("Prodotto " + productId + " non disponibile su Google Play: " + result.getDebugMessage());
                return;
            }
            ProductDetails details = detailsResult.getProductDetailsList().get(0);
            BillingFlowParams.ProductDetailsParams.Builder offer =
                    BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(details);
            List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
            if (offers != null && !offers.isEmpty()) {
                offer.setOfferToken(offers.get(0).getOfferToken());
            }
            BillingFlowParams flow = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(offer.build())).build();
            getActivity().runOnUiThread(() -> {
                activePurchase = call;
                activeProductId = productId;
                BillingResult launched = client.launchBillingFlow(getActivity(), flow);
                if (launched.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    activePurchase = null;
                    activeProductId = null;
                    call.reject("Google Play non ha avviato l'acquisto: " + launched.getDebugMessage());
                }
            });
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        PluginCall pending = activePurchase;
        String productId = activeProductId;
        if (pending == null) return;
        activePurchase = null;
        activeProductId = null;
        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            queryOwned(pending);
            return;
        }
        if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            pending.reject("Acquisto annullato", "USER_CANCELLED");
            return;
        }
        if (code != BillingClient.BillingResponseCode.OK || purchases == null) {
            pending.reject("Acquisto non completato: " + result.getDebugMessage());
            return;
        }
        for (Purchase purchase : purchases) {
            if (!purchase.getProducts().contains(productId)) continue;
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
                pending.reject("Pagamento in attesa di conferma da Google Play");
                return;
            }
            if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                acknowledge(purchase);
                queryOwned(pending);
                return;
            }
        }
        pending.reject("Google Play non ha confermato l'acquisto di " + productId);
    }
}
