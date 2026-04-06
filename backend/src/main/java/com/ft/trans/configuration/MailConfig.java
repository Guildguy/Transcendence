package com.ft.trans.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import java.util.Properties;

/**
 * Configuração de Email
 * 
 * Cria explicitamente o bean JavaMailSender com as propriedades
 * definidas no application.yml ou variáveis de ambiente.
 */
@Configuration
public class MailConfig {
    
    @Value("${spring.mail.host:sandbox.smtp.mailtrap.io}")
    private String mailHost;
    
    @Value("${spring.mail.port:2525}")
    private int mailPort;
    
    @Value("${spring.mail.username:}")
    private String mailUsername;
    
    @Value("${spring.mail.password:}")
    private String mailPassword;
    
    @Value("${spring.mail.protocol:smtp}")
    private String protocol;
    
    @Value("${spring.mail.default-encoding:UTF-8}")
    private String encoding;
    
    @Bean
    public JavaMailSender javaMailSender() {
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("📧 Configurando Servidor de Email");
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("  Host:     " + mailHost);
        System.out.println("  Port:     " + mailPort);
        System.out.println("  Username: " + (mailUsername != null && !mailUsername.isEmpty() ? mailUsername : "NÃO CONFIGURADO"));
        System.out.println("  Password: " + (mailPassword != null && !mailPassword.isEmpty() ? "***" + mailPassword.substring(Math.max(0, mailPassword.length() - 3)) : "NÃO CONFIGURADO"));
        System.out.println("  Protocol: " + protocol);
        System.out.println("═══════════════════════════════════════════════════════");
        
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);
        mailSender.setDefaultEncoding(encoding);
        mailSender.setProtocol(protocol);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "false");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        props.put("mail.debug", "false");
        
        return mailSender;
    }
}


