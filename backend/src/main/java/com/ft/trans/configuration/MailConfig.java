package com.ft.trans.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

/**
 * Configuração de Email
 * 
 * O Spring Boot automaticamente cria o bean JavaMailSender
 * quando as propriedades spring.mail.* estão definidas.
 * 
 * Se as variáveis de ambiente não forem definidas, o serviço
 * de recuperação de senha não funcionará, mas a aplicação
 * ainda será iniciada.
 */
@Configuration
public class MailConfig {
    
    @Value("${spring.mail.host:}")
    private String mailHost;
    
    @Value("${spring.mail.port:2525}")
    private int mailPort;
    
    @Value("${spring.mail.username:}")
    private String mailUsername;
    
    @Value("${spring.mail.password:}")
    private String mailPassword;
    
    @Bean
    public String mailConfigDebug() {
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("📧 Configuração de Servidor de Email");
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("  Host:     " + (mailHost != null && !mailHost.isEmpty() ? mailHost : "NÃO CONFIGURADO"));
        System.out.println("  Port:     " + mailPort);
        System.out.println("  Username: " + (mailUsername != null && !mailUsername.isEmpty() ? mailUsername : "NÃO CONFIGURADO"));
        System.out.println("  Password: " + (mailPassword != null && !mailPassword.isEmpty() ? "***" + mailPassword.substring(Math.max(0, mailPassword.length() - 3)) : "NÃO CONFIGURADO"));
        System.out.println("═══════════════════════════════════════════════════════");
        return "Mail config initialized";
    }
}

