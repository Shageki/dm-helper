import React from "react"
import "./stylesheets/dm_helper.css"

const Monster = require("./components/monster").default
const DropDown = require("./components/dropdown").default

const SizeModifiers = require("./data/encounterSizeModifiers")
const MonsterLibrary = require("./data/monsters")
const HomeBrewLibrary = require("./data/monsters_homebrew")

export default class EncounterGenerator extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      averagePlayerLevel: "4",
      partySize: "4",
      difficulty: "Medium",
      encounterSize: "3-6",
      budgetWiggle: "20%",
      monsterType: "All",
      attempts: 10000
    }
  }

  getBudget() {
    let budget = SizeModifiers.xpBudgetByPartyLevel[this.state.averagePlayerLevel][SizeModifiers.indexByDifficulty[this.state.difficulty]]
    budget = budget * parseInt(this.state.partySize)
    return budget
  }

  getDifficultySizeModifier() {
    let modifier = SizeModifiers.modifierByPartyAndEncounterSize[this.state.partySize][SizeModifiers.indexByEncounterSize[this.state.encounterSize]]
    return modifier
  }

  getAdjustedBudget() {
    let budget = this.getBudget() / this.getDifficultySizeModifier()
    return budget
  }

  getWiggle() {
    let wiggle = parseFloat(this.state.budgetWiggle.slice(0,2))/100
    return wiggle
  }

  getXpByCr(cr) {
    let xp = SizeModifiers.xpByCR[cr]
    return xp
  }

  getMonsterTypes() {
    let monsterTypes = MonsterLibrary.map(x => x.type)
    monsterTypes.unshift('All')
    let uniqueTypes = new Set(monsterTypes);
    uniqueTypes = Array.from(uniqueTypes)
    return uniqueTypes
  }
  getMonsterTags() {}

  randomFromArray(array) {
    if (array === undefined) {
      return false
    }
    let random = array[Math.floor(Math.random() * array.length)]
    return random
  }

  getEncounter() {
    // what can we work with?
    var budget = this.getAdjustedBudget()

    var validateEncounter = encounter => {
      let lowerLimit = parseFloat(budget) * (1 - this.getWiggle())
      let higherLimit = parseFloat(budget) * (1 + this.getWiggle())
      let withinLimit = true
      if (encounter.xp < lowerLimit) {
        withinLimit = false
      }
      if (encounter.xp > higherLimit) {
        withinLimit = false
      }
      return withinLimit
    }

    // filter all monsters to only include relevant monsters
    let monsters = []
    for (let monster of MonsterLibrary) {
      let include = true
      // filter CR > Player level monsters out
      if (monster.challenge_rating > this.state.averagePlayerLevel) {
        include = false
      }
      // filter big XP creatures out
      if (this.getXpByCr(monster.challenge_rating) > budget*( 1 + this.getWiggle() )) {
        include = false
      }
      // filter out types that don't match
      if (this.state.monsterType!== 'All' && monster.type !== this.state.monsterType) {
        include = false
        }
      if (include === true) {
        monsters.push(monster)
      }
    }

    var getMonsters = () => {
      var encounter = {
        xp: 0,
        content: []
      }
      let targetNumber = this.randomFromArray(SizeModifiers.countBySize[this.state.encounterSize])

      // if all monsters are filtered out, through the gremlin (which will fail all checks)
      if (monsters.length === 0) {
        encounter = {
          xp: 10,
          content: [
            {
              "name": "React Gremlin",
              "challenge_rating": 0
            }
          ]
        }
        return encounter
      }
      // loop through and grab x number of creatures and add them to encounter array
      for (let i = 0; i < targetNumber; i++) {
        encounter.content.push(this.randomFromArray(monsters))
      }

      // add up xp and validate
      let totalXP = 0
      for (let i = 0; i < encounter.content.length; i++) {
        let value = this.getXpByCr(encounter.content[i]["challenge_rating"])
        totalXP += value
      }
      encounter.xp = totalXP
      return encounter
    }

    var encounter = getMonsters()
    var goodEncounter = validateEncounter(encounter)
    // we need to abandon after so many attempts to avoid going unresponsive
    var attempts = 0

    for (attempts; attempts <= this.state.attempts; attempts++) {
      if (goodEncounter === true) {
        break
      } else {
        if (attempts === this.state.attempts) {
          window.alert(`Could not create good match after ${this.state.attempts} attempts. Check your filters.`)
          encounter = {
            xp: 10,
            content: [
              {
                "name": "React Gremlin",
                "challenge_rating": 0
              }
            ]
          }
          break
        } else {
          encounter = getMonsters()
          goodEncounter = validateEncounter(encounter)
        }
      }
    }
    return encounter
  }

  stateUpdater(updateLocation, updateMethod, updateContent) {
    if (this.state[`${updateLocation}`] === undefined) {
      throw new Error(`stateUpdate failed - unknown updateLocation "${updateLocation}"`)
    }
    if (this.state[updateLocation] === updateContent) {
      // don't update state if it isn't different
      return false
    }
    switch (updateMethod) {
      case "replace":
        this.setState({ [updateLocation]: updateContent })
        break
      case "add":
        this.setState({ [updateLocation]: updateContent })
        break
      case "remove":
        this.setState({ [updateLocation]: updateContent })
        break
      default:
        throw new Error(`stateUpdate failed - unknown updateMethod "${updateMethod}"`)
    }
  }

  integerArray(start, end) {
    return Array(end - start + 1)
      .fill()
      .map((item, index) => String(start + index))
  }

  listMonsters(monsters) {
    if (monsters.length === 1) {
      return (
        <Monster key={`${monsters[0].name}_1`} monster={monsters[0]} xp={this.getXpByCr(monsters[0]["challenge_rating"])} />
      )
    }
    return (
      <React.Fragment>
        {monsters.map((monster, index) => (
          <Monster key={`${monster.name}_${index}`} monster={monster} xp={this.getXpByCr(monster["challenge_rating"])} />
        ))}
      </React.Fragment>
    )
  }

  render() {
    var encounter = this.getEncounter()
    return (
      <div className='encounter-generator chain-border'>
        <div className='encounter-details'>
          <div className='encounter-detail'>
            Avg Player Level:
            <DropDown
              key='averagePlayerLevel'
              default={this.state.averagePlayerLevel}
              options={this.integerArray(1, 20)}
              updateMethod='replace'
              updateLocation='averagePlayerLevel'
              updateData={this.stateUpdater.bind(this)}
            />
          </div>
          <div className='encounter-detail'>
            Party Size:
            <DropDown
              key='partySize'
              default={this.state.partySize}
              options={this.integerArray(1, 8)}
              updateMethod='replace'
              updateLocation='partySize'
              updateData={this.stateUpdater.bind(this)}
            />
          </div>
          <div className='encounter-detail'>
            Difficulty:
            <DropDown
              key='difficulty'
              default={this.state.difficulty}
              options={["Easy", "Medium", "Hard", "Deadly"]}
              updateMethod='replace'
              updateLocation='difficulty'
              updateData={this.stateUpdater.bind(this)}
            />
          </div>
          <div className='encounter-detail'>
            Encounter Size:
            <DropDown
              key='encounterSize'
              default={this.state.encounterSize}
              options={["1", "2", "3-6", "7-10", "11-14", "15+"]}
              updateMethod='replace'
              updateLocation='encounterSize'
              updateData={this.stateUpdater.bind(this)}
            />
          <div className='encounter-detail'>
            Monster Type:
            <DropDown
              key='monsterType'
              default={this.state.monsterType}
              options={this.getMonsterTypes()}
              updateMethod='replace'
              updateLocation='monsterType'
              updateData={this.stateUpdater.bind(this)}
            />
          </div>
            <div className='encounter-detail'>
              Budget Tolerance
            <DropDown
              key='budgetWiggle'
              default={this.state.budgetWiggle}
              options={["10%","20%","30%","40%","50%"]}
              updateMethod='replace'
              updateLocation='budgetWiggle'
              updateData={this.stateUpdater.bind(this)}
            />
        </div>
          </div>
          <div>
            <details>
            <summary>
              Encounter Budget Details
            </summary>
            <div>
              Base Budget: {this.getBudget()} ({this.getBudget() / this.state.partySize} * {this.state.partySize})
            </div><div>
              Adjusted Budget: {this.getAdjustedBudget()} ({this.getBudget()} / {this.getDifficultySizeModifier()})
            </div>
            <div>Valid Range: {parseFloat(this.getAdjustedBudget()) * (1 - this.getWiggle())} - {parseFloat(this.getAdjustedBudget()) * (1 + this.getWiggle())}</div>
          </details>
            <h3>
              Encounter: {encounter.xp} ({encounter.xp / this.state.partySize}/person)
            </h3>
          </div>
        </div>
        <div className="encounter-monster-list">
          {this.listMonsters(encounter.content)}
        </div>
      </div>
    )
  }
}

/*
Monsters are added as a key then number
If the number hits 0, remove that key entirely
Delete just sets value to 0

Sort order is defined by place in array by default
moving up/down changes the sort value then triggers a manual
recalculation of the remaining items
if a == b, if a-1 does not exist, b = a -1, else a+1
this is a destructive mutation -
objectToSort = sortObjectOrders(objectToSort, key, value)
pass the sort module the source object
it iterates over the source object, resorting each value
then returns the source object
*/
