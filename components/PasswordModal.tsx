import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button } from 'react-native';
import { Field } from './Field';

type PasswordModalProps = {
  isVisible: boolean;
  onSubmit: (password: string) => void;
  onClose: () => void;
  isDark: boolean;
};

export const PasswordModal: React.FC<PasswordModalProps> = ({ isVisible, onSubmit, onClose, isDark }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (password) {
      onSubmit(password); // Pass the password to parent component
    } else {
      alert('Password is required.');
    }
  };

  return (
    <Modal transparent visible={isVisible}>
      <View className='flex-1 justify-center items-center' >
        <View className='bg-white dark:bg-zinc-950 py-8 px-6 rounded-xl'>
          <Field
            title='Please enter your current password:'
            value={password}
            isDark={isDark}
            placeholder='Enter current password'
            handleChangeText={setPassword}
          />
          <View className='flex flex-row justify-between'>
            <Button color={'red'} title="Cancel" onPress={onClose} />
            <Button title="Submit" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
};