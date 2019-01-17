package com.nativejs;

import android.net.Uri;
//import android.util.Base64;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.io.ByteArrayOutputStream;
import java.io.File;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.nativejs.IORejectionException;

public class IOModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext reactContext;

    public IOModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AndroidFileSystem";
    }

    private InputStream getInputStream(String filePath) throws IORejectionException {
        Uri uri = Uri.parse(filePath);
        InputStream stream;
        try {
            stream = this.reactContext.getContentResolver().openInputStream(uri);
        } catch (FileNotFoundException ex) {
            throw new IORejectionException("ENOENT", "ENOENT: no such file or directory, open '" + filePath + "'");
        }
        if (stream == null) {
            throw new IORejectionException("ENOENT", "ENOENT: could not open an input stream for '" + filePath + "'");
        }
        return stream;
    }

    private static byte[] getInputStreamBytes(InputStream inputStream) throws IOException {
        byte[] bytes;
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        int bufferSize = 1024;
        byte[] buffer = new byte[bufferSize];
        try {
            int len;
            while((len = inputStream.read(buffer)) != -1) {
                byteStream.write(buffer, 0, len);
            }
            bytes = byteStream.toByteArray();
        } finally {
            try {
                byteStream.close();
            } catch (IOException ignored) {

            }
        }
        return bytes;
    }

    private void reject(Promise promise, String filePath, Exception ex) {
        if (ex instanceof FileNotFoundException) {
            promise.reject("ENOENT", "ENOENT: no such file or directory, open '" + filePath + "'");
        }
        else if (ex instanceof IORejectionException) {
            IORejectionException ioRejectionException = (IORejectionException) ex;
            promise.reject(ioRejectionException.getCode(), ioRejectionException.getMessage());
        }
        else
            promise.reject(null, ex.getMessage());
      }

    @ReactMethod
    public void read(String filePath, Promise promise) {
        try {
            InputStream inputStream = getInputStream(filePath);
            byte[] inputData = getInputStreamBytes(inputStream);
            //String base64Content = Base64.encodeToString(inputData, Base64.NO_WRAP);
            String decoded = new String(inputData, "UTF-8");
            promise.resolve(decoded);
        } catch (Exception ex) {
            reject(promise, filePath, ex);
        }
    }

    @ReactMethod
    public void exists(String filePath, Promise promise) {
        try {
            File file = new File(filePath);
            promise.resolve(file.exists());
        } catch (Exception ex) {
            reject(promise, filePath, ex);
        }
    }
}