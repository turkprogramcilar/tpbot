using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class EnemyCollection
{
    List<Enemy> aliveEnemies = new List<Enemy>();

    public void Add(Enemy enemy)
    {
        this.aliveEnemies.Add(enemy);
    }

    public void GameUpdate()
    {
        for (int i = aliveEnemies.Count - 1; i >= 0; i--)
        {
            Enemy enemy = aliveEnemies[i];
            if (enemy.GameUpdate() == false)
            {
                aliveEnemies.RemoveAt(i);
            }
        }
    }
}
