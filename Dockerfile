FROM eclipse-temurin:21-jammy AS builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends maven && \
    rm -rf /var/lib/apt/lists/*

COPY pom.xml mvnw* ./
COPY .mvn/ .mvn

RUN chmod +x mvnw && \
    { ./mvnw dependency:go-offline -B -DskipTests || \
      mvn dependency:go-offline -B -DskipTests; }

COPY src/ src/

RUN { ./mvnw clean package -DskipTests || \
      mvn clean package -DskipTests; } && \
    if [ ! -f "/app/target/Donation_Record_System-1.0.0.jar" ]; then \
        echo "Error: JAR file not found!"; \
        ls -la /app/target/; \
        exit 1; \
    fi

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN mkdir -p /app/config

COPY --from=builder /app/target/Donation_Record_System-1.0.0.jar app.jar

COPY src/main/resources/application-production.properties /app/config/

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+OptimizeStringConcat -XX:+UseStringDeduplication"

EXPOSE ${PORT:-8080}

RUN useradd -m myapp && chown -R myapp:myapp /app
USER myapp

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar --spring.config.location=file:/app/config/application-production.properties"]