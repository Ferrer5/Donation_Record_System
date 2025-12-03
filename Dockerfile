FROM eclipse-temurin:21-jammy as builder
WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline -B
COPY src ./src${PORT:-8080} -Dspring.profiles.active=productio
RUN ./mvnw clean package -DskipTests
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/donation-report-system-*.jar app.jar
RUN mkdir -p /app/config
COPY src/main/resources/application-production.properties /app/config/
EXPOSE ${PORT:-8080}
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=production -jar app.jar"]