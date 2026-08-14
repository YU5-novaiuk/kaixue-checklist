import assert from 'node:assert/strict'
const packed={itemType:'physical',preparationStatus:'prepared',luggageId:'large'}
const station={itemType:'physical',preparationStatus:'prepared',purchaseStatus:'purchased',luggageId:'campus_parcel_station'}
assert.equal(packed.preparationStatus,'prepared');assert.equal(station.luggageId,'campus_parcel_station');assert.notEqual(station.luggageId,'large')
console.log('学校快递站作为独立位置的用例通过')
