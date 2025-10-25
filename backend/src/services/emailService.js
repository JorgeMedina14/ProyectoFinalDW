const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicacion'
      }
    });
  }

  // Verificar conexión del servicio de correo
  async verifyConnection() {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Servicio de correo en modo desarrollo (credenciales no configuradas)');
        return false;
      }

      // Verificar la conexión real con Gmail
      await this.transporter.verify();
      console.log('✅ Servicio de correo conectado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en el servicio de correo:', error);
      console.error('💡 Verifica que EMAIL_USER y EMAIL_PASS estén configurados correctamente');
      return false;
    }
  }

  // Enviar correo de receta programada
  async sendMealReminder(userEmail, userName, mealData) {
    try {
      // Verificar si el servicio está configurado
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Correo no enviado: credenciales no configuradas');
        throw new Error('Servicio de correo no configurado');
      }

      console.log(`📧 Preparando correo de comida para ${userEmail}...`);

      const { mealType, recipeName, recipeDescription, ingredients, instructions, mealTime, dayName } = mealData;
      
      const emailTemplate = await this.generateMealReminderTemplate({
        userName,
        mealType,
        recipeName,
        recipeDescription,
        ingredients,
        instructions,
        mealTime,
        dayName
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `🍽️ Es hora de tu ${mealType}: ${recipeName}`,
        html: emailTemplate
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Correo de comida enviado a ${userEmail} para ${mealType}: ${recipeName}`);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Error al enviar correo de comida:', error);
      throw error; // Re-lanzar para que el scheduler lo maneje
    }
  }

  // Enviar resumen semanal del menú
  async sendWeeklyMenuSummary(userEmail, userName, weeklyMenuData) {
    try {
      // Verificar si el servicio está configurado
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Correo semanal no enviado: credenciales no configuradas');
        return { success: false, message: 'Servicio de correo no configurado' };
      }

      console.log(`📧 Preparando resumen semanal para ${userEmail}...`);
      
      const emailTemplate = await this.generateWeeklyMenuTemplate({
        userName,
        title,
        weekStartDate,
        weekEndDate,
        days
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `📅 Tu menú semanal: ${title}`,
        html: emailTemplate
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Resumen semanal enviado a ${userEmail}`);
      return { success: true, result };
    } catch (error) {
      console.error('❌ Error al enviar resumen semanal:', error);
      throw error; // Re-lanzar para que el scheduler lo maneje
    }
  }

  // Generar plantilla HTML para recordatorio de comida
  async generateMealReminderTemplate(data) {
    const template = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Es hora de cocinar</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                border: 1px solid #e0e0e0;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .meal-type {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                margin-bottom: 20px;
            }
            .recipe-title {
                color: #667eea;
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .recipe-description {
                color: #666;
                margin-bottom: 20px;
                font-style: italic;
            }
            .section {
                margin-bottom: 25px;
            }
            .section h3 {
                color: #333;
                border-bottom: 2px solid #667eea;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            .ingredients-list {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .ingredients-list ul {
                margin: 0;
                padding-left: 20px;
            }
            .ingredients-list li {
                margin-bottom: 5px;
            }
            .instructions {
                background: #fff3cd;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ffc107;
            }
            .footer {
                text-align: center;
                color: #666;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            .emoji {
                font-size: 20px;
            }
            .time-info {
                background: linear-gradient(45deg, #28a745, #20c997);
                color: white;
                padding: 10px;
                border-radius: 8px;
                text-align: center;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><span class="emoji">🍽️</span> ¡Es hora de cocinar!</h1>
                <p>Hola <%= userName %>, tu comida está programada</p>
            </div>

            <div class="time-info">
                <strong><%= dayName %> - <%= mealTime %></strong>
            </div>

            <div class="meal-type">
                <h2><span class="emoji">🍳</span> <%= mealType.toUpperCase() %></h2>
            </div>

            <div class="recipe-title">
                <%= recipeName %>
            </div>

            <% if (recipeDescription) { %>
            <div class="recipe-description">
                <%= recipeDescription %>
            </div>
            <% } %>

            <% if (ingredients && ingredients.length > 0) { %>
            <div class="section">
                <h3><span class="emoji">🛒</span> Ingredientes</h3>
                <div class="ingredients-list">
                    <ul>
                        <% ingredients.forEach(ingredient => { %>
                        <li><%= ingredient %></li>
                        <% }); %>
                    </ul>
                </div>
            </div>
            <% } %>

            <% if (instructions) { %>
            <div class="section">
                <h3><span class="emoji">👨‍🍳</span> Instrucciones</h3>
                <div class="instructions">
                    <%= instructions %>
                </div>
            </div>
            <% } %>

            <div class="footer">
                <p><span class="emoji">💖</span> ¡Que disfrutes tu comida!</p>
                <p><small>Menu Planner - Tu asistente culinario personal</small></p>
            </div>
        </div>
    </body>
    </html>
    `;

    return ejs.render(template, data);
  }

  // Generar plantilla HTML para resumen semanal
  async generateWeeklyMenuTemplate(data) {
    const template = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resumen Menú Semanal</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 700px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .week-info {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 25px;
                text-align: center;
            }
            .day-section {
                margin-bottom: 25px;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                overflow: hidden;
            }
            .day-header {
                background: #f8f9fa;
                padding: 15px;
                font-weight: bold;
                font-size: 18px;
                color: #333;
                border-bottom: 1px solid #e0e0e0;
            }
            .meals-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                padding: 20px;
            }
            .meal-card {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            }
            .meal-card.has-recipe {
                background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                border-color: #28a745;
            }
            .meal-type {
                font-weight: bold;
                color: #667eea;
                margin-bottom: 8px;
            }
            .recipe-name {
                color: #333;
                font-weight: 600;
            }
            .empty-meal {
                color: #6c757d;
                font-style: italic;
            }
            .footer {
                text-align: center;
                color: #666;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 <%= title %></h1>
                <p>¡Hola <%= userName %>! Aquí tienes tu menú semanal</p>
            </div>

            <div class="week-info">
                <strong>Semana del <%= new Date(weekStartDate).toLocaleDateString('es-ES') %> 
                al <%= new Date(weekEndDate).toLocaleDateString('es-ES') %></strong>
            </div>

            <% days.forEach(day => { %>
            <div class="day-section">
                <div class="day-header">
                    <%= day.dayOfWeek.charAt(0).toUpperCase() + day.dayOfWeek.slice(1) %> - 
                    <%= new Date(day.date).toLocaleDateString('es-ES') %>
                </div>
                <div class="meals-grid">
                    <% day.meals.forEach(meal => { %>
                    <div class="meal-card <%= meal.recipeName ? 'has-recipe' : '' %>">
                        <div class="meal-type">
                            <% if (meal.mealType === 'desayuno') { %>🥐<% } %>
                            <% if (meal.mealType === 'almuerzo') { %>🍽️<% } %>
                            <% if (meal.mealType === 'cena') { %>🍱<% } %>
                            <% if (meal.mealType === 'merienda') { %>🍪<% } %>
                            <%= meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1) %>
                        </div>
                        <% if (meal.recipeName) { %>
                        <div class="recipe-name"><%= meal.recipeName %></div>
                        <% } else { %>
                        <div class="empty-meal">Sin planificar</div>
                        <% } %>
                    </div>
                    <% }); %>
                </div>
            </div>
            <% }); %>

            <div class="footer">
                <p>💖 ¡Que tengas una semana deliciosa!</p>
                <p><small>Menu Planner - Tu asistente culinario personal</small></p>
            </div>
        </div>
    </body>
    </html>
    `;

    return ejs.render(template, data);
  }

  // Enviar correo de prueba
  async sendTestEmail(userEmail, userName) {
    try {
      // Verificar si el servicio está configurado
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Servicio de correo no configurado. Verifica EMAIL_USER y EMAIL_PASS en .env');
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: '✅ Configuración de correo exitosa - Menu Planner',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
              <h1>🎉 ¡Configuración Exitosa!</h1>
              <p>Hola ${userName}, tu sistema de notificaciones está funcionando correctamente.</p>
            </div>
            <div style="padding: 20px; background: #f8f9fa; margin-top: 20px; border-radius: 10px;">
              <p>A partir de ahora recibirás notificaciones automáticas sobre:</p>
              <ul>
                <li>🍽️ Recordatorios de comidas programadas</li>
                <li>📅 Resúmenes semanales de tu menú</li>
                <li>🛒 Listas de compras sugeridas</li>
              </ul>
            </div>
            <div style="text-align: center; margin-top: 20px; padding: 20px;">
              <p style="color: #666; font-size: 14px;">
                Este es un correo de prueba enviado desde tu aplicación Menu Planner
              </p>
              <p style="color: #666; font-size: 12px;">
                📧 Enviado el ${new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Correo de prueba enviado a ${userEmail}`);
      return { success: true, result };
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();