const { SQLDataSource } = require('../../utils/sqlDataSource')
const conferenceColumns = [
  'Id',
  'Name',
  'ConferenceTypeId',
  'LocationId',
  'OrganizerEmail',
  'StartDate',
  'EndDate',
  'CategoryId'
]
class ConferenceDb extends SQLDataSource {
  generateWhereClause(queryBuilder, filters = {}) {
    const { startDate, endDate, organizerEmail } = filters
    if (startDate) queryBuilder.andWhere('StartDate', '>=', startDate)
    if (endDate) queryBuilder.andWhere('EndDate', '<=', endDate)
    if (organizerEmail) queryBuilder.andWhere('OrganizerEmail', organizerEmail)
  }
  async getConferenceList(pager, filters) {
    const { page, pageSize } = pager
    const values = await this.knex
      .select(...conferenceColumns)
      .from('Conference')
      .modify(this.generateWhereClause, filters)
      .orderBy('Id')
      .offset(page * pageSize)
      .limit(pageSize)
    return { values }
  }
  async getConferenceListTotalCount(filters) {
    return await this.knex('Conference').count('Id', { as: 'TotalCount' }).modify(this.generateWhereClause, filters).first()
  }
  async getConferenceById(id) {
    const result = await this.knex
      .select(...conferenceColumns)
      .from('Conference')
      .where('Id', id)
      .first()
    return result
  }
  async updateConferenceXAttendee({ attendeeEmail, conferenceId, statusId }) {
    const existing = await this.knex
      .select('Id', 'AttendeeEmail', 'ConferenceId')
      .from('ConferenceXAttendee')
      .where('AttendeeEmail', attendeeEmail)
      .andWhere('ConferenceId', conferenceId)
      .first()
    const updateAttendee = {
      AttendeeEmail: attendeeEmail,
      ConferenceId: conferenceId,
      StatusId: statusId
    }
    let result
    if (existing?.id) {
      //update
      result = await this.knex('ConferenceXAttendee').update(updateAttendee, 'StatusId').where('Id', existing?.id)
    } else {
      //insert
      result = await this.knex('ConferenceXAttendee').returning('StatusId').insert(updateAttendee)
    }
    return result[0]
  }
  async updateLocation(location) {
    const content = {
      Name: location.name,
      Address: location.address,
      Latitude: location.latitude,
      Longitude: location.longitude,
      CityId: location.cityId,
      CountyId: location.countyId,
      CountryId: location.countryId
    }
    const output = ['Id', 'Name', 'Address', 'Latitude', 'Longitude', 'CountryId', 'CountyId', 'CityId']
    let result
    if (location.id) {
      result = await this.knex('Location').update(content, output).where('Id', location.id)
    } else {
      result = await this.knex('Location').returning(output).insert(content)
    }
    return result[0]
  }
  async updateConference({ id, name, organizerEmail, startDate, endDate, location, category, type }) {
    const content = {
      Name: name,
      OrganizerEmail: organizerEmail,
      StartDate: startDate,
      EndDate: endDate,
      LocationId: location.id,
      CategoryId: category.id,
      ConferenceTypeId: type.id
    }
    const output = ['Id', 'Name', 'OrganizerEmail', 'StartDate', 'EndDate', 'ConferenceTypeId', 'LocationId', 'CategoryId']
    let result
    if (id) {
      result = await this.knex('Conference').update(content, output).where('Id', id)
    } else {
      result = await this.knex('Conference').returning(output).insert(content)
    }
    return result[0]
  }
  async updateSpeaker({ id, name, nationality, rating }) {
    const content = {
      Name: name,
      Nationality: nationality,
      Rating: rating
    }
    const output = ['Id', 'Name', 'Nationality', 'Rating']
    let result
    if (id > 0) {
      result = await this.knex('Speaker').update(content, output).where('Id', id)
    } else {
      result = await this.knex('Speaker').returning(output).insert(content)
    }
    return result[0]
  }
  async updateConferenceXSpeaker({ speakerId, isMainSpeaker, conferenceId }) {
    const current = await this.knex
      .select('Id')
      .from('ConferenceXSpeaker')
      .where('SpeakerId', speakerId)
      .andWhere('ConferenceId', conferenceId)
    let result
    if (current.id) {
      result = await this.knex('ConferenceXSpeaker')
        .update({ IsMainSpeaker: Boolean(isMainSpeaker) }, 'IsMainSpeaker')
        .where('Id', current.id)
    } else {
      result = await this.knex('ConferenceXSpeaker')
        .returning('IsMainSpeaker')
        .insert({ SpeakerId: speakerId, IsMainSpeaker: Boolean(isMainSpeaker), ConferenceId: conferenceId })
    }
    return result[0]
  }
  async deleteSpeakers(speakerIds) {
    await this.knex('ConferenceXSpeaker').whereIn('SpeakerId', speakerIds).del()
    await this.knex('Speaker').whereIn('Id', speakerIds).del()
  }

  async getUsers(id) {
    const userEmails = await this.knex
      .select('AttendeeEmail')
      .from('ConferenceXAttendee')
      .where('ConferenceId', id)
      .andWhere('StatusId', 1)
    return userEmails
  }
}
module.exports = ConferenceDb
