using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;

public class Enemy : MonoBehaviour, IFactoryProduct {

    GameTile from, to;
    Vector3 start, end;
    float progress;
    GameObjectFactory originFactory;

    static Dictionary<string, Material> dictionary = new Dictionary<string, Material>();

    public GameObjectFactory OriginFactory
    {
        get => originFactory;
        set
        {
            Debug.Assert(originFactory == null, "Redefinition is not allowed");
            originFactory = value;
        }
    }
    public void SetMaterialUrl(string url)
    {
        if (dictionary.ContainsKey(url) == false)
        {
            StartCoroutine(DownloadImage(url));
        }
        else
        {
            GetComponentInChildren<MeshRenderer>().material = dictionary[url];
        }
        Vector2[] uvs = GetComponentInChildren<MeshFilter>().sharedMesh.uv;

        uvs[6] = new Vector2(0, 0);
        uvs[7] = new Vector2(1, 0);
        uvs[10] = new Vector2(0, 1);
        uvs[11] = new Vector2(1, 1);

        GetComponentInChildren<MeshFilter>().sharedMesh.uv = uvs;
    }
    IEnumerator DownloadImage(string MediaUrl)
    {
        UnityWebRequest request = UnityWebRequestTexture.GetTexture(MediaUrl);
        yield return request.SendWebRequest();
        if (request.result != UnityWebRequest.Result.Success)
            Debug.Log(request.error);
        else
        {
            var r = GetComponentInChildren<MeshRenderer>().material = new Material(GetComponentInChildren<MeshRenderer>().material);
            r.mainTexture = ((DownloadHandlerTexture)request.downloadHandler).texture;
            dictionary[MediaUrl] = r;
        }
    }

    public bool GameUpdate()
    {
        progress += Time.deltaTime;
        while (progress >= 1f)
        {
            from = to;
            to = to.NextTileOnPath;
            if (to == null)
            {
                OriginFactory.Reclaim(this);
                return false;
            }
            start = from.transform.localPosition;
            end = to.transform.localPosition;
            progress -= 1f;
        }

        transform.localPosition = Vector3.LerpUnclamped(start, end, progress);
        return true;
    }

    public void SpawnOn(GameTile spawnPoint)
    {
        Debug.Assert(spawnPoint.NextTileOnPath != null, "Nowhere to go");
        transform.localPosition = spawnPoint.transform.localPosition;
        from = spawnPoint;
        to = spawnPoint.NextTileOnPath;
        start = from.transform.localPosition;
        end = to.transform.localPosition;
        progress = 0f;
    }
}