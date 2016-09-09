/**
 * BasicHTTPClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ESP8266HTTPClient.h>

#define USE_SERIAL Serial

ESP8266WiFiMulti WiFiMulti;

void setup() {

    USE_SERIAL.begin(115200);
   // USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

    for(uint8_t t = 4; t > 0; t--) {
        USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
        USE_SERIAL.flush();
        delay(1000);
    }

    WiFiMulti.addAP("iPhone 6", "parthconnect");

}

void loop() {
    // wait for WiFi connection
    if((WiFiMulti.run() == WL_CONNECTED)) {

        HTTPClient http;

        USE_SERIAL.print("[HTTP] begin...\n");
        // configure traged server and url
        http.begin("172.20.10.1",8080, ""); //HTTP

        USE_SERIAL.print("[HTTP] GET...\n");

        String s = "title=foo&body=bar&userId=1";      
        http.addHeader("Content-Type", "application/x-www-form-urlencoded");



        
        // start connection and send HTTP header
        int httpCode = http.POST(s);
        if(httpCode) {
            // HTTP header has been send and Server response header has been handled
            USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

            // file found at server
            if(httpCode == 200) {

                http.writeToStream(&Serial);

              
               // String payload = http.getString();
                USE_SERIAL.println(Serial);
                http.end();

            }
        } else {
            USE_SERIAL.print("[HTTP] GET... failed, no connection or no HTTP server\n");
        }
    }

    delay(10000);
}

