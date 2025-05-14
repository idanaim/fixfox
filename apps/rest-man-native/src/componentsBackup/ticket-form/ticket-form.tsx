import React from "react";
import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import UseSaveTicket from '../../queries/use-save-ticket';

export function TicketForm() {
  const{mutate:saveTicket}=UseSaveTicket();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      assignee: "",
      reporter: "",
      status: "Open",
      priority: "Low",
      description: "",
      equipmentDetails: "",
    },
  });
  const onFormSubmit = (data) => {
    const newTicket = {
      ...data,
      _id: `${Date.now()}`,
      created: new Date(),
      updated: new Date(),
    };
    saveTicket(newTicket);
    reset(); // Reset form fields after submission
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Ticket</Text>

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <Controller
        control={control}
        name="title"
        rules={{ required: "Title is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.title && styles.errorBorder]}
            placeholder="Enter ticket title"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

      {/* Assignee */}
      <Text style={styles.label}>Assignee</Text>
      <Controller
        control={control}
        name="assignee"
        rules={{ required: "Assignee is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.assignee && styles.errorBorder]}
            placeholder="Enter assignee name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.assignee && <Text style={styles.errorText}>{errors.assignee.message}</Text>}

      {/* Reporter */}
      <Text style={styles.label}>Reporter</Text>
      <Controller
        control={control}
        name="reporter"
        rules={{ required: "Reporter is required" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.reporter && styles.errorBorder]}
            placeholder="Enter reporter name"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.reporter && <Text style={styles.errorText}>{errors.reporter.message}</Text>}

      {/* Status */}
      <Text style={styles.label}>Status</Text>
      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            style={styles.picker}
            onValueChange={onChange}
          >
            <Picker.Item label="Open" value="Open" />
            <Picker.Item label="In Progress" value="In Progress" />
            <Picker.Item label="Closed" value="Closed" />
          </Picker>
        )}
      />

      {/* Priority */}
      <Text style={styles.label}>Priority</Text>
      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            style={styles.picker}
            onValueChange={onChange}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
          </Picker>
        )}
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter ticket description"
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
          />
        )}
      />

      {/* Equipment Details */}
      <Text style={styles.label}>Equipment Details</Text>
      <Controller
        control={control}
        name="equipmentDetails"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter equipment details"
            value={value}
            onChangeText={onChange}
          />
        )}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onFormSubmit)}
      >
        <Text style={styles.submitButtonText}>Create Ticket</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#6200ea",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
    marginBottom: 16,
  },
  errorBorder: {
    borderColor: "#d32f2f",
  },
  submitButton: {
    backgroundColor: "#6200ea",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
