using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

using NativeWebSocket;
using System.Text.RegularExpressions;

public class WebSocketClient : MonoBehaviour
{
    [SerializeField] UnityEngine.UI.Text Text;
    public Queue<string> Emojis { get; set; } = new Queue<string>();

    WebSocket websocket;

    // Start is called before the first frame update
    async void Start()
    {
        websocket = new WebSocket("wss://unity-ogreniyoruz-tp-ailesi.herokuapp.com/");//"ws://localhost:3000");

        websocket.OnOpen += () =>
        {
            Debug.Log("Connection open!");
        };

        websocket.OnError += (e) =>
        {
            Debug.Log("Error! " + e);
            Text.text = "Bir hata meydana geldi. " + e;
            Text.gameObject.SetActive(true);
        };

        websocket.OnClose += (e) =>
        {
            Debug.Log("Connection closed!");
        };

        websocket.OnMessage += (bytes) =>
        {
            Debug.Log("OnMessage!");
            // getting the message as a string
            try
            {
                var message = System.Text.Encoding.UTF8.GetString(bytes);
                MatchCollection matches = new Regex("\"(.+?)\"").Matches(message);
                foreach (Match match in matches)
                {
                    Emojis.Enqueue(match.Groups[1].Value);
                }
            }
            catch (Exception ex)
            {
                Debug.LogError(ex.Message);
            }
        };

        // Keep sending messages at every 0.3s
        InvokeRepeating("SendWebSocketMessage", 0.0f, 0.3f);

        // waiting for messages
        await websocket.Connect();
    }

    void Update()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        websocket.DispatchMessageQueue();
#endif
    }

    async void SendWebSocketMessage()
    {
        if (websocket.State == WebSocketState.Open)
        {
            // Sending bytes
            await websocket.Send(new byte[] { 10, 20, 30 });

            // Sending plain text
            await websocket.SendText("plain text message");
        }
    }

    private async void OnApplicationQuit()
    {
        await websocket.Close();
    }

}