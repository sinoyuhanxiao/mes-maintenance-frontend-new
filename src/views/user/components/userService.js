// mock user service
import { ref } from 'vue'

// Simulated in-memory database
const users = ref( [
  {
    id : 1,
    name : 'Alice',
    username : 'alice1',
    email : 'alice@example.com',
    role : { id : 1, name : 'Manager', el_tag_type : 'danger' },
    activation_status : 0,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 2,
    name : 'Bob',
    username : 'bob88',
    email : 'bob@example.com',
    role : { id : 2, name : 'Supervisor', el_tag_type : 'primary' },
    activation_status : 1,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 3,
    name : 'Charlie',
    username : 'charlie99',
    email : 'charlie@example.com',
    role : { id : 3, name : 'Team Lead', el_tag_type : 'warning' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        team_name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 4,
    name : 'Diana',
    username : 'diana22',
    email : 'diana@example.com',
    role : { id : 4, name : 'Worker', el_tag_type : 'success' },
    activation_status : 1,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 5,
    name : 'Ethan',
    username : 'ethan333',
    email : 'ethan@example.com',
    role : { id : 1, name : 'Manager', el_tag_type : 'danger' },
    activation_status : 0,
    teams : [],
    leadership_teams : [],
    phone_number : 1234
  },
  {
    id : 6,
    name : 'Fiona',
    username : 'fiona456',
    email : 'fiona@example.com',
    role : { id : 2, name : 'Supervisor', el_tag_type : 'primary' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        team_name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 7,
    name : 'George',
    username : 'george77',
    email : 'george@example.com',
    role : { id : 3, name : 'Team Lead', el_tag_type : 'warning' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        team_name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 8,
    name : 'Hannah',
    username : 'hannah88',
    email : 'hannah@example.com',
    role : { id : 4, name : 'Worker', el_tag_type : 'success' },
    activation_status : 1,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 9,
    name : 'Ivan',
    username : 'ivanx',
    email : 'ivan@example.com',
    role : { id : 1, name : 'Manager', el_tag_type : 'danger' },
    activation_status : 0,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 10,
    name : 'Jasmine',
    username : 'jazzmin',
    email : 'jasmine@example.com',
    role : { id : 2, name : 'Supervisor', el_tag_type : 'primary' },
    activation_status : 1,
    teams : [
      {
        id : 2,
        team_name : 'Team B'
      }
    ],
    leadership_teams : [],
    phone_number : 1234
  },
  {
    id : 11,
    name : 'Kevin',
    username : 'kevk',
    email : 'kevin@example.com',
    role : { id : 3, name : 'Team Lead', el_tag_type : 'warning' },
    activation_status : 1,
    teams : [
      {
        id : 2,
        team_name : 'Team B'
      }
    ],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 12,
    name : 'Lily',
    username : 'lilyrose',
    email : 'lily@example.com',
    role : { id : 4, name : 'Worker', el_tag_type : 'success' },
    activation_status : 1,
    teams : [
      {
        id : 1,
        team_name : 'Team A',
        leader_name : 'Alice'
      }
    ],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 13,
    name : 'Max',
    username : 'maxpower',
    email : 'max@example.com',
    role : { id : 2, name : 'Supervisor', el_tag_type : 'primary' },
    activation_status : 0,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 14,
    name : 'Nora',
    username : 'nora99',
    email : 'nora@example.com',
    role : { id : 3, name : 'Team Lead', el_tag_type : 'warning' },
    activation_status : 1,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  },
  {
    id : 15,
    name : 'Oscar',
    username : 'oscarthegreat',
    email : 'oscar@example.com',
    role : { id : 4, name : 'Worker', el_tag_type : 'success' },
    activation_status : 1,
    teams : [],
    leadership_teams : [],
    phone_number : '1234'
  }
] )

export const getUsers = async() => {
  return [...users.value]
}

export const getUserById = async id => {
  return users.value.find( u => u.id === id || u.sub === id )
}

export const createUser = async user => {
  const newUser = {
    ...user,
    id : Date.now(),
    sub : `uuid-${Date.now()}`
  }
  users.value.push( newUser )
  return newUser
}

export const updateUser = async( id, updates ) => {
  const index = users.value.findIndex( u => u.id === id || u.sub === id )
  if ( index !== -1 ) {
    users.value[index] = { ...users.value[index], ...updates }
    return users.value[index]
  }
  throw new Error( 'User not found' )
}

export const deleteUser = async id => {
  const index = users.value.findIndex( u => u.id === id || u.sub === id )
  if ( index !== -1 ) {
    users.value.splice( index, 1 )
    return true
  }
  return false
}

export const updateUserActivation = async( id, status ) => {
  const user = users.value.find( u => u.id === id || u.sub === id )
  if ( user ) {
    user.activation_status = status
    return user
  }
  throw new Error( 'User not found' )
}

// Optional: expose users directly for read-only reactive use
export const useUserList = () => users
