import React from 'react'

// DropDown accepts an array of options, a default,
// and a callback function to update the parent's state
//
// <DropDown
//    key = string
//    options = [strings]
//    default = string
//    handler = callback() />

export default class DropDown extends React.Component {
  constructor(props) {
    super(props)

    if (this.props.options.includes(this.props.default) === true) {
      this.state = { value: this.props.default }
    } else {
      console.error(`Attempted to initialize dropdown without valid default value\nDefault: ${this.props.default}\nOptions: ${this.props.options}`)
    }
    this.props.updateData(this.props.updateLocation, this.props.updateMethod, this.state.value)
  }

  setValue(option) {
    this.props.updateData(this.props.updateLocation, this.props.updateMethod, option)
  }

  render() {
    return (
      <select defaultValue={this.state.value} onChange={(e)=>{this.setValue(e.currentTarget.value)}}>
          {this.props.options.map((option, index) => <option key={`${option}+${index}`} value={option}>{option}</option>)}
      </select>
    )
  }
}
