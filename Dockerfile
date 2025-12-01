# Use official OpenJDK 21 image as base (matches your pom.xml)
FROM eclipse-temurin:21-jammy as builder

# Set working directory
WORKDIR /app

# Copy Maven wrapper and POM
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Use a smaller JRE image for production
FROM eclipse-temurin:21-jre-jammy

# Set working directory
WORKDIR /app

# Copy the JAR file from the builder stage
COPY --from=builder /app/target/donation-report-system-*.jar app.jar

# Create config directory and copy production properties
RUN mkdir -p /app/config
COPY src/main/resources/application-production.properties /app/config/

# Expose the port the app runs on
# Railway uses $PORT environment variable
EXPOSE ${PORT:-8080}

# Set the command to run the application
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=production -jar app.jar"]
