const ProgressTracker = ({ currentStep }) => {
  const steps = ['Describe', 'Identify', 'Solve', 'Complete'];

  return (
    <View style={styles.progressContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View style={[
            styles.stepCircle,
            currentStep >= index && styles.activeStep
          ]}>
            {currentStep > index ? (
              <Ionicons name="checkmark" size={16} color="white" />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          {index < steps.length - 1 && (
            <View style={[
              styles.connector,
              currentStep > index && styles.activeConnector
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};
