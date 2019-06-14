import React from 'react';
import './stylesheets/dm_helper.css';

const EncounterGenerater = require('./encounter_generator').default
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

export default class DmHelper extends React.Component {

render() {
  return (
    <div className="dm-helper">
      <div className="dm-helper-header">
        <h1>DM Helper</h1>
      </div>
      <div className="dm-helper-body">
        <EncounterGenerater />
      </div>
      <div className="dm-helper-footer">
        <p>June 3rd 2019 - version 0.0.1</p>
      </div>
    </div>
  );
}
}
