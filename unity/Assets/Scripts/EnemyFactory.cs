using UnityEngine;

[CreateAssetMenu]
public class EnemyFactory : GameObjectFactory {

	[SerializeField] Enemy prefab = default;

	public Enemy Get()
    {
        Enemy instance = CreateGameObjectInstance(prefab);
        instance.OriginFactory = this;
        return instance;
	}
}