# Stage 1: Build the application
FROM eclipse-temurin:21-jammy as builder

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml first (better layer caching)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable and download dependencies
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline -B

# Copy source code
COPY src/ ./src/

# Build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-jammy

# Set working directory
WORKDIR /app

# Copy the built JAR file
COPY --from=builder /app/target/donation-report-system-*.jar app.jar

# Create config directory and copy production properties
RUN mkdir -p /app/config
COPY src/main/resources/application-production.properties /app/config/

# Expose the port the app runs on
EXPOSE ${PORT:-8080}

# Run the application
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=production -jar app.jar"]