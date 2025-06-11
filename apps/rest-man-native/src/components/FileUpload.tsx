import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadProps {
  type: 'image' | 'document';
  endpoint: string;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  placeholder?: string;
  currentImageUri?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type,
  endpoint,
  onUploadSuccess,
  onUploadError,
  placeholder,
  currentImageUri,
}) => {
  const { isUploading, uploadProgress, pickImage, pickDocument, uploadFile } = useFileUpload();

  const handleFilePick = async () => {
    try {
      const file = type === 'image' ? await pickImage() : await pickDocument();
      
      if (!file) {
        return;
      }

      const result = await uploadFile(file, endpoint);
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      
      if (onUploadError) {
        onUploadError(error as Error);
      }
      
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    }
  };

  const getButtonText = () => {
    if (isUploading) {
      return `Uploading... ${uploadProgress}%`;
    }
    
    if (type === 'image') {
      return currentImageUri ? 'Change Image' : 'Select Image';
    }
    
    return 'Select Document';
  };

  return (
    <View style={styles.container}>
      {placeholder && <Text style={styles.placeholder}>{placeholder}</Text>}
      
      {currentImageUri && type === 'image' && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: currentImageUri }} style={styles.previewImage} />
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={handleFilePick}
        disabled={isUploading}
      >
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      </TouchableOpacity>
      
      {isUploading && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  placeholder: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
}); 