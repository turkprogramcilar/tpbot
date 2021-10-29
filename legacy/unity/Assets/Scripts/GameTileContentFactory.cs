using UnityEngine;

[CreateAssetMenu]
public class GameTileContentFactory : GameObjectFactory {

	[SerializeField] GameTileContent destinationPrefab = default;
	[SerializeField] GameTileContent emptyPrefab       = default;
	[SerializeField] GameTileContent wallPrefab        = default;
	[SerializeField] GameTileContent spawnerPrefab     = default;


	public GameTileContent Get (GameTileContentType type) {
		switch (type) {
			case GameTileContentType.Destination: return Get(destinationPrefab);
			case GameTileContentType.Empty:       return Get(emptyPrefab);
			case GameTileContentType.Wall:        return Get(wallPrefab);
			case GameTileContentType.SpawnPoint:  return Get(spawnerPrefab);
		}
		Debug.Assert(false, "Unsupported type: " + type);
		return null;
	}

	GameTileContent Get (GameTileContent prefab) {
		GameTileContent instance = CreateGameObjectInstance(prefab);
		instance.OriginFactory = this;
		return instance;
	}
}