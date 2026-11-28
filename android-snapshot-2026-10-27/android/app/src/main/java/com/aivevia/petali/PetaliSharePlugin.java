package com.aivevia.petali;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Opens the Android system share chooser with the actual PETALI PNG card.
 * The image is temporary and stays in app cache, available to receiving apps
 * via the existing FileProvider. No external-storage permissions are needed.
 */
@CapacitorPlugin(name = "PetaliShare")
public class PetaliSharePlugin extends Plugin {
    private static final int MAX_BASE64_LENGTH = 10_000_000;
    private static final byte[] PNG_HEADER = { (byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a };

    @PluginMethod
    public void shareImage(PluginCall call) {
        String gif = call.getString("gifBase64");
        boolean animated = gif != null;
        String encoded = animated ? gif : call.getString("pngBase64");
        byte[] expected = animated ? new byte[]{71,73,70,56,57,97} : PNG_HEADER;
        String mime = animated ? "image/gif" : "image/png";
        if (encoded == null || encoded.isEmpty() || encoded.length() > MAX_BASE64_LENGTH) {
            call.reject("Invalid image or image too large.");
            return;
        }
        try {
            byte[] png = Base64.decode(encoded, Base64.DEFAULT);
            if (png.length < expected.length) {
                call.reject("Missing image.");
                return;
            }
            for (int i = 0; i < expected.length; i++) {
                if (png[i] != expected[i]) {
                    call.reject("Invalid image signature.");
                    return;
                }
            }
            File folder = new File(getContext().getCacheDir(), "petali-regali");
            if (!folder.exists() && !folder.mkdirs()) {
                call.reject("Impossibile preparare il biglietto.");
                return;
            }
            File image = File.createTempFile("petali-regalo-", animated ? ".gif" : ".png", folder);
            try (FileOutputStream stream = new FileOutputStream(image)) {
                stream.write(png);
            }
            Uri contentUri = FileProvider.getUriForFile(
                getContext(), getContext().getPackageName() + ".fileprovider", image
            );
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType(mime);
            send.putExtra(Intent.EXTRA_STREAM, contentUri);
            String message = call.getString("text", "");
            if (!message.isEmpty()) send.putExtra(Intent.EXTRA_TEXT, message);
            send.setClipData(ClipData.newRawUri("PETALI", contentUri));
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(send, null);
            chooser.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().runOnUiThread(() -> {
                try {
                    getActivity().startActivity(chooser);
                    call.resolve();
                } catch (Exception e) {
                    call.reject("Impossibile aprire le app di condivisione.", e);
                }
            });
        } catch (IllegalArgumentException | IOException e) {
            call.reject("Impossibile preparare il biglietto.", e);
        } catch (Exception e) {
            call.reject("Condivisione Android non disponibile.", e);
        }
    }
}
