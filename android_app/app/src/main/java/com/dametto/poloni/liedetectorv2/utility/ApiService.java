package com.dametto.poloni.liedetectorv2.utility;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Url;

public interface ApiService {
    @Multipart
    @POST
    Call<ResponseBody> postVideo(@Url String url, @Part MultipartBody.Part video, @Part("upload") RequestBody name, @Header("Authorization") String authToken);

    @Multipart
    @POST
    Call<ResponseBody> postFrame(@Url String url,  @Part MultipartBody.Part frame, @Part("upload") RequestBody name, @Header("Authorization") String authToken);
}
