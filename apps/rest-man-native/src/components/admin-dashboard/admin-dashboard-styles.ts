import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  /* Employee Section Specific Styles */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71', // Green color for add actions
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  employeeList: {
    marginTop: 8,
  },
  employeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
  },
  employeeText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    marginHorizontal: 4,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 8,
  },
  iconButton: {
    padding: 6,
  },


  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 16,
    marginBottom: 8,
  },
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  employeeName: {
    fontSize: 14,
    color: '#2c3e50',
  },
  employeeRole: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    backgroundColor: '#fff',
  },
  selectedUserItem: {
    backgroundColor: '#f8f9fa',
  },
  userName: {
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 12,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },



  /* Modal Styles */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dfe4e9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  saveButton: {
    backgroundColor: '#3498db', // Blue color for save actions
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#bdc3c7', // Gray color for cancel
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Loading States */
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#7f8c8d', // Darker gray when disabled
  },




  sectionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
