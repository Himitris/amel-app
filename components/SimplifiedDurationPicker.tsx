// components/SimplifiedDurationPicker.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

type DurationOption = {
  label: string;
  minutes: number;
};

type SimplifiedDurationPickerProps = {
  selectedDuration: number;
  onSelect: (minutes: number) => void;
  options?: DurationOption[];
};

const DEFAULT_OPTIONS: DurationOption[] = [
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1h', minutes: 60 },
  { label: '1h30', minutes: 90 },
  { label: '2h', minutes: 120 },
];

const SimplifiedDurationPicker: React.FC<SimplifiedDurationPickerProps> = ({
  selectedDuration,
  onSelect,
  options = DEFAULT_OPTIONS,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Durée</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.minutes}
            style={[
              styles.option,
              selectedDuration === option.minutes && styles.selectedOption,
            ]}
            onPress={() => onSelect(option.minutes)}
          >
            <Text
              style={[
                styles.optionText,
                selectedDuration === option.minutes && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    borderWidth: 1,
    borderColor: COLORS.veryLightGray,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  selectedOptionText: {
    color: COLORS.background,
    fontWeight: '500',
  },
});

export default SimplifiedDurationPicker;