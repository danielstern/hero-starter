/* 

  The only function that is required in this file is the "move" function

  You MUST export the move function, in order for your code to run
  So, at the bottom of this code, keep the line that says:

  module.exports = move;

  The "move" function must return "North", "South", "East", "West", or "Stay"
  (Anything else will be interpreted by the game as "Stay")
  
  The "move" function should accept two arguments that the website will be passing in: 
    - a "gameData" object which holds all information about the current state
      of the battle

    - a "helpers" object, which contains useful helper functions
      - check out the helpers.js file to see what is available to you

    (the details of these objects can be found on javascriptbattle.com/#rules)

  This file contains four example heroes that you can use as is, adapt, or
  take ideas from and implement your own version. Simply uncomment your desired
  hero and see what happens in tomorrow's battle!

  Such is the power of Javascript!!!

*/

//TL;DR: If you are new, just uncomment the 'move' function that you think sounds like fun!
//       (and comment out all the other move functions)


// // The "Northerner"
// // This hero will walk North.  Always.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   return 'North';
// };

// // The "Blind Man"
// // This hero will walk in a random direction each turn.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   var choices = ['North', 'South', 'East', 'West'];
//   return choices[Math.floor(Math.random()*4)];
// };

// // The "Priest"
// // This hero will heal nearby friendly champions.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   if (myHero.health < 60) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestTeamMember(gameData);
//   }
// };

// // The "Unwise Assassin"
// // This hero will attempt to kill the closest enemy hero. No matter what.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   if (myHero.health < 30) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestEnemy(gameData);
//   }
// };

// // The "Careful Assassin"
// // This hero will attempt to kill the closest weaker enemy hero.
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;
//   if (myHero.health < 50) {
//     return helpers.findNearestHealthWell(gameData);
//   } else {
//     return helpers.findNearestWeakerEnemy(gameData);
//   }
// };

// // "Bone Clinkz"
var move = function(gameData, helpers) {
    console.info("*rattle rattle rattle*");

    helpers.opposite = function(dir) {
        if (dir === "North") return "South";
        if (dir === "East") return "West";
        if (dir === "South") return "North";
        if (dir === "West") return "East";
    }

    helpers.getAggro = function(hero, target) {
        var healthRating = target.health;
        var proximityRating = helpers.getDistanceBetweenTwoHeroes(hero, target) * 20;

        return healthRating + proximityRating;
    }

    helpers.getNumberOfCloseEnemies = function(hero,enemies) {
      return enemies.filter(function(enemy){
        return helpers.getDistanceBetweenTwoHeroes(hero,enemy) < 4;
      }).length
    }


    helpers.getDistanceBetweenTwoHeroes = function(hero1, hero2) {
        var y = Math.abs(hero1.distanceFromTop - hero2.distanceFromTop);
        var x = Math.abs(hero1.distanceFromLeft - hero2.distanceFromLeft);

        return y + x;

    }

    var hero = gameData.activeHero;
    var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, hero, function(boardTile) {
        if (boardTile.type === 'HealthWell') {
            return true;
        }
    });
    var distanceToHealthWell = healthWellStats.distance;
    var directionToHealthWell = healthWellStats.direction;

    if (hero.health < 50) {
        console.info("**rattle!!!*** (I must heal!)");
        return helpers.findNearestHealthWell(gameData);
    } else if (hero.health < 100 && distanceToHealthWell === 1) {
        console.info("*shake shake*... (Time to heal.)");
        return directionToHealthWell;
    };

    var enemies = gameData.heroes.filter(function(enemy) {
        return enemy.team !== hero.team && !enemy.dead;
    });
    var allies = gameData.heroes.filter(function(enemy) {
        return enemy.team === hero.team
    });

    if (helpers.getNumberOfCloseEnemies(hero,enemies) > 1) {
      console.log("Run away!");
      return helpers.opposite(helpers.findNearestEnemy(gameData));
    }


    var targets = enemies.filter(function(enemy) {
        return allies.some(function(ally) {
            return helpers.getDistanceBetweenTwoHeroes(ally, enemy) >= 3;
        });
    });

    var target;

    if (targets) {
        target = targets.reduce(function(prev, next) {
            if (helpers.getAggro(hero, prev) > helpers.getAggro(hero, next)) {
                return next;
            } else {
                return prev;
            }
        })
    }

    console.info("**shake rattle shake!!** (I will target...)", target.id);
    console.info("**hiss!!**", enemies.map(function(enemy) {
        return {
            id: enemy.id,
            aggro: helpers.getAggro(hero, enemy),
        }
    }));

    var pathInfoObject = helpers.findNearestObjectDirectionAndDistance(gameData.board, hero, function(enemyTile) {
        return enemyTile.id === target.id;
    })

    // console.log("final directoin...",pathInfoObject);

    if (!pathInfoObject) {
        console.log("*shhhaaake*! (I will find gold");
        return helpers.findNearestUnownedDiamondMine(gameData);
    }

    //Return the direction that needs to be taken to achieve the goal
    return pathInfoObject.direction;

    // if (myHero.health < 40) {
    //   //Heal no matter what if low health
    //   return directionToHealthWell;
    // } else if (myHero.health < 100 && distanceToHealthWell === 1) {
    //   //Heal if you aren't full health and are close to a health well already
    //   return directionToHealthWell;
    // } else {
    //   //If healthy, go capture a diamond mine!
    //   return helpers.findNearestNonTeamDiamondMine(gameData);
    // }
};

// // The "Selfish Diamond Miner"
// // This hero will attempt to capture diamond mines (even those owned by teammates).
// var move = function(gameData, helpers) {
//   var myHero = gameData.activeHero;

//   //Get stats on the nearest health well
//   var healthWellStats = helpers.findNearestObjectDirectionAndDistance(gameData.board, myHero, function(boardTile) {
//     if (boardTile.type === 'HealthWell') {
//       return true;
//     }
//   });

//   var distanceToHealthWell = healthWellStats.distance;
//   var directionToHealthWell = healthWellStats.direction;

//   if (myHero.health < 40) {
//     //Heal no matter what if low health
//     return directionToHealthWell;
//   } else if (myHero.health < 100 && distanceToHealthWell === 1) {
//     //Heal if you aren't full health and are close to a health well already
//     return directionToHealthWell;
//   } else {
//     //If healthy, go capture a diamond mine!
//     return helpers.findNearestUnownedDiamondMine(gameData);
//   }
// };

// // The "Coward"
// // This hero will try really hard not to die.
// var move = function(gameData, helpers) {
//   return helpers.findNearestHealthWell(gameData);
// }


// Export the move function here
module.exports = move;
