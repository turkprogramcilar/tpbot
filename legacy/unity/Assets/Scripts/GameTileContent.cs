using UnityEngine;

public class GameTileContent : MonoBehaviour, IFactoryProduct {

	[SerializeField]
	GameTileContentType type = default;

	GameObjectFactory originFactory;

	public GameTileContentType Type => type;

	public GameObjectFactory OriginFactory {
		get => originFactory;
		set {
			Debug.Assert(originFactory == null, "Redefined origin factory!");
			originFactory = value;
		}
	}

    public void Recycle () {
		OriginFactory.Reclaim(this);
	}
}