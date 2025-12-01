# Use official OpenJDK 17 image as base
FROM eclipse-temurin:17-jdk-jammy as builder

# Set working directory
WORKDIR /app

# Copy the gradle files first to leverage Docker cache
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw package -DskipTests

# Use a smaller runtime image
FROM eclipse-temurin:17-jre-jammy

# Set working directory
WORKDIR /app

# Copy the JAR file from the builder stage
COPY --from=builder /app/target/donation-report-system-*.jar app.jar

# Copy the production properties file
COPY src/main/resources/application-production.properties /app/config/

# Expose the port the app runs on
EXPOSE 8080

# Set the command to run the application
ENTRYPOINT ["java", "-Dspring.profiles.active=production", "-jar", "app.jar"]
