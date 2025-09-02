// services/teamService.js (Mock In-Memory Version)

import { ref, computed } from 'vue'

// TODO: In-memory team data mock, replace with backend service later
const mockTeamData = ref( [
  {
    id : 1,
    name : 'QC Team A',
    parent_team_id : null,
    level : 1,
    description : '',
    members : [
      { user_id : 101, isLeader : true },
      { user_id : 102, isLeader : false },
      { user_id : 103, isLeader : false }
    ],
    status : 1,
    created_at : '2025-08-15T18:53:38.624593Z',
    created_by : 1,
    updated_at : 2
  },
  {
    id : 2,
    name : 'Maintenance Team B',
    parent_team_id : null,
    level : 1,
    description : '',
    members : [{ user_id : 107, isLeader : true }],
    status : 1,
    created_at : '2025-08-15T18:53:38.624593Z',
    created_by : 1,
    updated_at : 2
  },
  {
    id : 3,
    name : 'Maintenance Team C',
    parent_team_id : null,
    level : 1,
    description : '',
    members : [{ user_id : 106, isLeader : true }],
    status : 1,
    created_at : '2025-08-15T18:53:38.624593Z',
    created_by : 1,
    updated_at : 2
  },
  {
    id : 4,
    name : 'Maintenance Team D',
    parent_team_id : null,
    level : 1,
    description : '',
    members : [{ user_id : 105, isLeader : true }],
    status : 1,
    created_at : '2025-08-15T18:53:38.624593Z',
    created_by : 1,
    updated_at : 2
  }
] )

let idCounter = 2

export function getAllTeams() {
  return Promise.resolve( { data : { status : '200', data : mockTeamData.value }} )
}

export function fetchTeamTree() {
  return Promise.resolve( { data : { status : '200', data : mockTeamData.value }} )
}

export function fetchTeamById( teamId ) {
  const team = mockTeamData.value.find( t => t.id === teamId )
  return Promise.resolve( { data : { status : '200', data : team }} )
}

export function createTeam( payload ) {
  const newTeam = {
    ...payload,
    id : idCounter++,
    created_at : new Date().toISOString(),
    updated_at : new Date().toISOString(),
    level : payload.parent_id ? 2 : 1
  }
  mockTeamData.value.push( newTeam )
  return Promise.resolve( { data : { status : '200', data : newTeam }} )
}

export function updateTeam( teamId, payload ) {
  const index = mockTeamData.value.findIndex( t => t.id === teamId )
  if ( index !== -1 ) {
    mockTeamData.value[index] = {
      ...mockTeamData.value[index],
      ...payload,
      updated_at : new Date().toISOString()
    }
    return Promise.resolve( { data : { status : '200', data : mockTeamData.value[index] }} )
  }
  return Promise.reject( new Error( 'Team not found' ) )
}

export function deleteTeam( teamId ) {
  const index = mockTeamData.value.findIndex( t => t.id === teamId )
  if ( index !== -1 ) {
    mockTeamData.value.splice( index, 1 )
    return Promise.resolve( { data : { status : '200' }} )
  }
  return Promise.reject( new Error( 'Team not found' ) )
}

export function fetchTeamDepth( teamId ) {
  const team = mockTeamData.value.find( t => t.id === teamId )
  const depth = team?.parent_id ? 2 : 1
  return Promise.resolve( { data : { status : '200', data : depth }} )
}

export function fetchCurrentLeaders() {
  const map = mockTeamData.value.reduce( ( acc, team ) => {
    if ( team.leader_id ) {
      acc.push( {
        user_id : team.leader_id,
        team_name : team.name,
        team_id : team.id
      } )
    }
    return acc
  }, [] )

  return Promise.resolve( { data : { status : '200', data : map }} )
}

export function useTeamList() {
  return computed( () => mockTeamData.value )
}

export function resetTeams( data = [] ) {
  mockTeamData.value = data
  idCounter = data.length + 1
}
