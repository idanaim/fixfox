import RNFS from 'react-native-fs';

export const readCSV = async (filename: string) => {
  try {
    const path = `${RNFS.MainBundlePath}/${filename}`;
    const csvContent = await RNFS.readFile(path, 'utf8');
    const rows = csvContent.split('\n');
    const headers = rows[0].split(',');

    return rows.slice(1).map(row => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index]?.trim();
        return obj;
      }, {} as any);
    });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
};
