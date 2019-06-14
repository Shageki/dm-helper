import React from 'react'

// Monster accepts a monster object,
// and a callback function to update the parent's state

export default class Monster extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      monster: this.props.monster,
      experience: this.props.xp
    }
    switch (`${this.props.monster.challenge_rating}`) {
      case '0.125':
        this.state.monster.challenge_rating = '1/8'
        break;
      case '0.25':
        this.state.monster.challenge_rating = '1/4'
        break;
      case '0.5':
        this.state.monster.challenge_rating = '1/2'
        break;
      default:
    }
  }

  render() {
    return (
      <div className="encounter-monster chain-border">
        <div className="encounter-monster-name">{this.state.monster.name}</div>
        <div className="encounter-monster-cr">CR {this.state.monster.challenge_rating}</div>
        <div className="encounter-monster-xp">XP {this.state.experience}</div>
      </div>
    )
  }
}
