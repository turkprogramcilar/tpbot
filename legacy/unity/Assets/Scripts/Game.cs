using UnityEngine;

public class Game : MonoBehaviour {

	[SerializeField] Vector2Int boardSize = new Vector2Int(11, 11);
	[SerializeField] GameBoard board = default;
	[SerializeField] GameTileContentFactory tileContentFactory = default;
	[SerializeField] EnemyFactory enemyFactory = default;
	[SerializeField] [Range(0.1f, 10)] float spawnSpeed = 1;

	EnemyCollection enemies = new EnemyCollection();
	WebSocketClient client = default;

	Ray TouchRay => Camera.main.ScreenPointToRay(Input.mousePosition);
	float spawnProgress = 0f;

    void Start()
    {
		client = gameObject.AddComponent<WebSocketClient>(); 
    }

    void Awake () {
		board.Initialize(boardSize, tileContentFactory);
		board.ShowGrid = true;
	}

	void OnValidate () {
		if (boardSize.x < 2) {
			boardSize.x = 2;
		}
		if (boardSize.y < 2) {
			boardSize.y = 2;
		}
	}

	void Update () {
		if (Input.GetMouseButtonDown(0)) {
			HandleTouch();
		}
		else if (Input.GetMouseButtonDown(1)) {
			HandleAlternativeTouch();
		}

		if (Input.GetKeyDown(KeyCode.V)) {
			board.ShowPaths = !board.ShowPaths;
		}
		if (Input.GetKeyDown(KeyCode.G)) {
			board.ShowGrid = !board.ShowGrid;
		}

		// spawn enemies
		if (client.Emojis.Count > 0)
			spawnProgress += spawnSpeed * Time.deltaTime;
		while (spawnProgress >= 1f && client.Emojis.Count > 0)
		{
			spawnProgress -= 1f;
			SpawnEnemy(client.Emojis.Dequeue());
		}

		// update enemies
		enemies.GameUpdate();
	}

	private void SpawnEnemy(string url)
    {
		GameTile spawnPoint = board.GetRandomSpawnPoint();
		Enemy enemy = enemyFactory.Get();
		enemy.SetMaterialUrl(url);
		enemy.SpawnOn(spawnPoint);
		enemies.Add(enemy);
    }

    void HandleAlternativeTouch () {
		GameTile tile = board.GetTile(TouchRay);
		if (tile != null) {
			if (Input.GetKey(KeyCode.LeftShift))
            {
				board.ToggleSpawner(tile);
            }
			else
            {
                board.ToggleDestination(tile);
            }
		}
	}

	void HandleTouch () {
		GameTile tile = board.GetTile(TouchRay);
		if (tile != null) {
			board.ToggleWall(tile);
		}
	}
}