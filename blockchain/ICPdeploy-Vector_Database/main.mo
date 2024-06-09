import Map "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Array "mo:base/Array";

actor VectorDatabase {

  type Vector = {
    value: Float;
  };

  func natHash(n : Nat) : Hash.Hash { 
    Text.hash(Nat.toText(n))
  };

  var vectors = Map.HashMap<Nat, Vector>(0, Nat.equal, natHash);
  var nextId : Nat = 0;

  public query func getVectors() : async [Vector] {
    Iter.toArray(vectors.vals());
  };

  public func addVector(value : Float) : async Nat {
    let id = nextId;
    vectors.put(id, { value = value;});
    nextId += 1;
    id
  };

  public func removeVector(id : Nat) : async Bool {
    switch (vectors.remove(id)) {
      case (null) { false };
      case (_) { true };
    }
  };

  public query func searchEngine(targetValue : Float, threshold : Float) : async [Vector] {
    let allVectors = Iter.toArray(vectors.vals());
    let closeVectors = Array.filter(allVectors, func(v: Vector) : Bool {
      Float.abs(v.value - targetValue) <= threshold
    });
    return closeVectors;
  };
}