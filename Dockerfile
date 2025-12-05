# Stage 1: Build the application
FROM eclipse-temurin:21-jammy AS builder

# Set working directory
WORKDIR /app

# Install Maven
RUN apt-get update && \
    apt-get install -y --no-install-recommends maven && \
    rm -rf /var/lib/apt/lists/*

# Copy only the files needed for downloading dependencies
COPY pom.xml mvnw* ./
COPY .mvn/ .mvn

# Download dependencies first (cached unless pom.xml changes)
RUN chmod +x mvnw && \
    { ./mvnw dependency:go-offline -B -DskipTests || \
      mvn dependency:go-offline -B -DskipTests; }

# Copy source code
COPY src/ src/

# Build the application (cached unless source changes)
RUN { ./mvnw clean package -DskipTests || \
      mvn clean package -DskipTests; } && \
    # Verify the JAR file exists and is not empty
    if [ ! -f "/app/target/Donation_Record_System-1.0.0.jar" ]; then \
        echo "Error: JAR file not found!"; \
        ls -la /app/target/; \
        exit 1; \
    fi

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-jammy

# Set working directory
WORKDIR /app

# Create config directory
RUN mkdir -p /app/config

# Copy the JAR file from the builder stage
COPY --from=builder /app/target/Donation_Record_System-1.0.0.jar app.jar

# Copy production properties
COPY src/main/resources/application-production.properties /app/config/

# Set JVM options for production
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+OptimizeStringConcat -XX:+UseStringDeduplication"

# Expose the port the app runs on
EXPOSE ${PORT:-8080}

# Use a non-root user
RUN useradd -m myapp && chown -R myapp:myapp /app
USER myapp

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# Command to run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar --spring.config.location=file:/app/config/application-production.properties"]