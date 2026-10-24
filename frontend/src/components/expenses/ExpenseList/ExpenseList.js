import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './ExpenseList.styles';
import { colors } from '../../../theme/colors';
import ExpenseItem from '../ExpenseItem/ExpenseItem';

function ExpenseList({ expenses = [], userMap = {}, onSelectExpense }) {
  if (expenses.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="receipt-outline" size={36} color={colors.textDim} />
        <Text style={styles.emptyTitle}>No Expenses Found</Text>
        <Text style={styles.emptySub}>
          Tap '+ Add Expense' to log bills, groceries, trip expenses or rent.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense._id || expense.id}
          expense={expense}
          userMap={userMap}
          onPress={onSelectExpense}
        />
      ))}
    </View>
  );
}

export default React.memo(ExpenseList);
