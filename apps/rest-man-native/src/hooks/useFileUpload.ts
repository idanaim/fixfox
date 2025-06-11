import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface FileUploadResult {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

interface UseFileUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  pickImage: () => Promise<FileUploadResult | null>;
  pickDocument: () => Promise<FileUploadResult | null>;
  uploadFile: (file: FileUploadResult, endpoint: string) => Promise<any>;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = async (): Promise<FileUploadResult | null> => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize,
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  const pickDocument = async (): Promise<FileUploadResult | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/pdf',
          size: asset.size,
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking document:', error);
      return null;
    }
  };

  const uploadFile = async (file: FileUploadResult, endpoint: string): Promise<any> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    pickImage,
    pickDocument,
    uploadFile,
  };
}; 