import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  // content:{
  //   padding: 16,
  // },
  /*Admin Section */
  adminCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    backgroundColor: '#48BB78',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
  },
  adminRole: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  detailsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  detailText: {
    flex: 1,
    fontSize: 16,
    color: '#4A5568',
  },
  AdminEditButton: {
    padding: 6,
  },
  // actionsContainer: {
  //   flexDirection: 'row',
  //   gap: 12,
  // },
  AdminActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4299E1',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  employeeInfo: {
    flex: 1,
    marginRight: 12
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginRight: 8,
    maxWidth: '60%'
  },
  employeeRole: {
    fontSize: 12,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  employeeEmail: {
    fontSize: 14,
    color: '#4A5568',
    opacity: 0.9
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  permissionButton: {
    backgroundColor: '#4299E1' // Blue
  },
  editButton: {
    backgroundColor: '#48BB78' // Green
  },
  deleteButton: {
    backgroundColor: '#F56565', // Red
    marginVertical: 8,
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
/* Business Card*/
  businessCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  businessType: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  addEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#48BB78',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F7FAFC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: '45%',
  },
  detailText: {
    fontSize: 14,
    color: '#4A5568',
  },
  employeesSection: {
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingTop: 16,
  },
  employeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  seeAllText: {
    color: '#4299E1',
    fontSize: 14,
  },
  employeeBadge: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4299E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '600',
  },
  employeeBadgeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2D3748',
    textAlign: 'center',
  },
  employeeBadgeRole: {
    fontSize: 10,
    color: '#718096',
    textAlign: 'center',
  },
  emptyEmployeesText: {
    color: '#A0AEC0',
    fontStyle: 'italic',
    marginVertical: 8,
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
