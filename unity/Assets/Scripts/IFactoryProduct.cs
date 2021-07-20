using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public interface IFactoryProduct
{
    GameObjectFactory OriginFactory { get; set; }
    GameObject gameObject { get; }
}
