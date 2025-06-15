const { ObjectId } = require('mongodb')
const User = require("../../models/User")
const Project = require("../../models/Project")
const Organisation = require("../../models/Organisation")
const Activity = require("../../models/Activity")

//change to import id from licence later
const organisationId = "677402a670b2a51ee527615e"

const Collections = {
  user: User,
  project: Project,
  organisation: Organisation,
  activity: Activity
}

module.exports = { Collections, organisationId, ObjectId }