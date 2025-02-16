import { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';

const App = () => {
  // State variables for persons, form inputs, notifications, etc.
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success');

  // Define the base URL for your API endpoint
  const baseUrl = 'http://localhost:3001/persons';

  // Helper function to GET all persons
  const getAllPersons = () => {
    return axios.get(baseUrl).then(response => response.data);
  };

  // Helper function to POST (create) a new person
  const createPerson = (personObject) => {
    return axios.post(baseUrl, personObject).then(response => response.data);
  };

  // Helper function to PUT (update) an existing person
  const updatePerson = (id, personObject) => {
    return axios.put(`${baseUrl}/${id}`, personObject).then(response => response.data);
  };

  // Helper function to DELETE a person
  const removePerson = (id) => {
    return axios.delete(`${baseUrl}/${id}`).then(response => response.data);
  };

  // Fetch the initial list of persons when the component mounts
  useEffect(() => {
    getAllPersons().then(initialPersons => {
      setPersons(initialPersons);
    });
  }, []);

  // Handlers for updating state based on input changes
  const handleNewName = (event) => setNewName(event.target.value);
  const handleNewNumber = (event) => setNewNumber(event.target.value);
  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  // Component for notifications
  const Notification = ({ message, type }) => {
    if (message === null) {
      return null;
    }
    return <div className={type}>{message}</div>;
  };

  // Helper function to display notifications
  const showNotification = (message, type = 'success') => {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handler for adding a new person (or updating an existing one)
  const addPerson = (event) => {
    event.preventDefault();

    const existingPerson = persons.find(person => person.name === newName);
    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already in the phonebook, replace the old number with the new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };

        updatePerson(existingPerson.id, updatedPerson)
          .then(returnedPerson => {
            setPersons(
              persons.map(person =>
                person.id !== existingPerson.id ? person : returnedPerson
              )
            );
            setNewName('');
            setNewNumber('');
            showNotification(`Updated ${newName}`, 'success');
          })
          .catch(error => {
            showNotification(`Error updating ${newName}`, 'error');
          });
      }
      return;
    }

    const personObject = { name: newName, number: newNumber };

    createPerson(personObject)
      .then(returnedPerson => {
        setPersons([...persons, returnedPerson]);
        setNewName('');
        setNewNumber('');
        showNotification(`Added ${newName}`, 'success');
      })
      .catch(error => {
        showNotification(`Error adding ${newName}`, 'error');
      });
  };

  // Handler for deleting a person
  const handleDeletePerson = (id) => {
    const person = persons.find(p => p.id === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      removePerson(id).then(() => {
        setPersons(persons.filter(p => p.id !== id));
      });
    }
  };

  // Filter persons based on the search term
  const filterPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Presentational components (you can also keep these in the same file)
  const Filter = ({ searchTerm, handleSearchChange }) => (
    <div>
      filter shown with: <input value={searchTerm} onChange={handleSearchChange} />
    </div>
  );

  const PersonForm = ({ newName, newNumber, handleNewName, handleNewNumber, addPerson }) => (
    <form onSubmit={addPerson}>
      <div>
        name: <input value={newName} onChange={handleNewName} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNewNumber} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );

  const Persons = ({ filterPersons, handleDeletePerson }) => (
    <div className="list">
      {filterPersons.map(person => (
        <div key={person.id}>
          {person.name} {person.number}{' '}
          <button onClick={() => handleDeletePerson(person.id)}>delete</button>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification} type={notificationType} />
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNewName={handleNewName}
        handleNewNumber={handleNewNumber}
        addPerson={addPerson}
      />
      <h3>Numbers</h3>
      <Persons filterPersons={filterPersons} handleDeletePerson={handleDeletePerson} />
    </div>
  );
};

export default App;
