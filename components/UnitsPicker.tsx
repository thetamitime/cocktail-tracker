import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import RNPickerSelect from 'react-native-picker-select';
import { getUnits, setUnitsInFirestore } from '@/api/firebaseFunctions';
import { useGlobal } from '@/context/GlobalProvider';

export const UnitsPicker: React.FC<{isDark: boolean}> = ({isDark}) => {
  const { user } = useGlobal();
  const [units, setUnits] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getMeasures = async () => {
      try {
        if (user && user.uid) {
          const unsubscribeUnits = await getUnits(user.uid, (fetchedUnits) => {
            setUnits(fetchedUnits); // Update units with the value from Firestore
          });
          return unsubscribeUnits; // Return unsubscribe function for cleanup
        }
      } catch (err) {
          console.log('Failed to get measures.', err);
      }
    };

    getMeasures();
  }, [user]);

  console.log("Selected unit:", units);

  return (
    <View className='py-3 flex flex-row justify-between items-center'>
        <Text className='font-bregular text-lg text-zinc-900 dark:text-zinc-50'>Volume unit</Text>
        <RNPickerSelect
            darkTheme={isDark}
            style={{
                inputIOS: {
                    fontFamily: 'BeVietnamPro-Medium',
                    fontSize: 18,
                    color: '#E9580C'
                }
            }}
            placeholder={{}} // Empty placeholder to avoid selection reset
            value={units} // Set value to display the current unit from Firestore
            onValueChange={(value) => {
                if (value) {
                  setUnits(value); // Update state with the selected unit
                  setUnitsInFirestore(user.uid, value); // Save selected unit to Firestore
                }
              }}
            items={[
                { label: 'oz', value: 'oz' },
                { label: 'ml', value: 'ml' },
            ]}
        />
    </View>
  );
};
