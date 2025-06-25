import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Balance from './components/Balance';
import IncomeExpenses from './components/IncomeExpenses';
import TransactionList from './components/TransactionList';
import AddTransaction from './components/AddTransaction';
import './App.css';

function App() {
  // FIX 1: Initialize state from localStorage safely.
  // We provide a function to useState's initial value. This function runs only once.
  const [transactions, setTransactions] = useState(() => {
    const localData = localStorage.getItem('transactions');
    // If localData exists, parse it. Otherwise, return an empty array.
    // This prevents the app from crashing on the first load.
    return localData ? JSON.parse(localData) : [];
  });

  // FIX 2: Use a single useEffect to save data to localStorage when it changes.
  // This effect runs only when the transactions state updates.
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);


  const addTransaction = (transaction) => {
    setTransactions(transactions => [...transactions, transaction]);
  }

  const handleDelete = (id) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  }

  return (
    <div className="container">
      <Header />
      <Balance transactions={transactions} />
      <IncomeExpenses transactions={transactions} />
      <TransactionList transactions={transactions} handleDelete={handleDelete} />
      <AddTransaction addTransaction={addTransaction} />
    </div>
  );
}

export default App;