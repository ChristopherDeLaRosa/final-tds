import { useState, useRef, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { askAI } from "../../../services/aiService";
import { Send, MessageCircle, X, Bot, User, Sparkles, ChevronRight } from "lucide-react";

// =================== ANIMACIONES =================== //
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const typingAnimation = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
`;

// =================== STYLED COMPONENTS =================== //
// Variables de color
const primaryColor = 'rgba(15, 23, 42, 0.6)';
const primarySolid = 'rgba(15, 23, 42, 0.95)';
const primaryLight = 'rgba(15, 23, 42, 0.2)';
const gradientBg = `linear-gradient(135deg, ${primarySolid} 0%, rgba(15, 23, 42, 0.8) 100%)`;
const gradientLight = `linear-gradient(135deg, ${primaryLight} 0%, rgba(15, 23, 42, 0.1) 100%)`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  background: ${gradientBg};
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: 
    0 10px 30px rgba(15, 23, 42, 0.3),
    0 0 0 0px rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  z-index: 10000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.5s ease-out;
  backdrop-filter: blur(5px);

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 
      0 15px 40px rgba(15, 23, 42, 0.4),
      0 0 0 4px rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.95);
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    top: 0;
    left: 0;
  }
`;

const ChatWrapper = styled.div`
  position: fixed;
  bottom: 10px;
  right: 30px;
  width: 380px;
  height: 550px;
  z-index: 10000;
  animation: ${slideIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
    bottom: 100px;
    height: 70vh;
  }
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(15, 23, 42, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(15, 23, 42, 0.1);
`;

const ChatHeader = styled.div`
  background: ${gradientBg};
  padding: 18px 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BotIcon = styled.div`
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Subtitle = styled.div`
  font-size: 12px;
  opacity: 0.9;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(5px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${primaryColor};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${primarySolid};
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: ${fadeIn} 0.3s ease-out;
  ${props => props.$isUser && css`flex-direction: row-reverse;`}
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${props => props.$isUser 
    ? gradientBg 
    : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'};
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: ${props => !props.$isUser && '1px solid rgba(255, 255, 255, 0.3)'};
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 14px 18px;
  border-radius: 18px;
  background: ${props => props.$isUser 
    ? gradientBg 
    : 'white'};
  color: ${props => props.$isUser ? 'white' : '#1e293b'};
  box-shadow: ${props => props.$isUser 
    ? '0 6px 20px rgba(15, 23, 42, 0.2)' 
    : '0 4px 15px rgba(15, 23, 42, 0.08)'};
  position: relative;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  border: ${props => !props.$isUser && '1px solid rgba(15, 23, 42, 0.05)'};
  font-size: 14px;

  ${props => props.$isUser 
    ? css`
        border-top-right-radius: 4px;
      `
    : css`
        border-top-left-radius: 4px;
      `}
`;

const TimeStamp = styled.div`
  font-size: 10px;
  color: ${props => props.$isUser ? 'rgba(255,255,255,0.7)' : 'rgba(15, 23, 42, 0.4)'};
  margin-top: 6px;
  text-align: ${props => props.$isUser ? 'right' : 'left'};
  font-weight: ${props => props.$isUser ? '400' : '500'};
`;

const InputContainer = styled.form`
  padding: 20px;
  background: white;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  gap: 12px;
  align-items: center;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const ChatInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  outline: none;
  font-size: 14px;
  background: #f8fafc;
  transition: all 0.3s;
  color: #1e293b;
  font-family: inherit;

  &:focus {
    border-color: ${primarySolid};
    background: white;
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }
`;

const SendButton = styled.button`
  background: ${gradientBg};
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.3);
    background: rgba(15, 23, 42, 0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.08);
  width: fit-content;
  margin-left: 42px;
  border: 1px solid rgba(15, 23, 42, 0.05);
`;

const TypingDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${gradientBg};
  animation: ${typingAnimation} 1.4s infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 24px 20px;
  background: white;
  border-radius: 16px;
  margin: 20px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.05);
`;

const WelcomeTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
`;

const WelcomeText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

const QuickQuestionButton = styled.button`
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  color: #334155;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-weight: 500;

  &:hover {
    background: rgba(15, 23, 42, 0.1);
    border-color: rgba(15, 23, 42, 0.2);
    transform: translateY(-1px);
  }
`;

// =================== COMPONENTE =================== //
export default function EnhancedChatWidget() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "¡Hola! Soy Zirak, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isSending) return;

    const userMessage = { 
      sender: "user", 
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsSending(true);

    try {
      setTyping(true);
      const response = await askAI(prompt);
      
      setTimeout(() => {
        setTyping(false);
        const aiMessage = { 
          sender: "ai", 
          text: response.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsSending(false);
      }, 800);

    } catch (error) {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: "Lo siento, he tenido un problema al procesar tu solicitud. Por favor, inténtalo de nuevo en un momento.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
      setIsSending(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setPrompt(question);
    setTimeout(() => inputRef.current.focus(), 100);
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      {!open && (
        <FloatingButton onClick={() => setOpen(true)}>
          <MessageCircle size={32} />
          <Sparkles 
            size={16} 
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} 
          />
        </FloatingButton>
      )}

      {/* CONTENEDOR DEL CHAT */}
      {open && (
        <ChatWrapper>
          <ChatContainer>
            <ChatHeader>
              <HeaderContent>
                <BotIcon>
                  <Bot size={20} />
                </BotIcon>
                <HeaderText>
                  <Title>
                    Zirak Assistant <Sparkles size={14} />
                  </Title>
                  <Subtitle>Tu asistente inteligente</Subtitle>
                </HeaderText>
              </HeaderContent>
              <CloseButton onClick={() => setOpen(false)}>
                <X size={20} />
              </CloseButton>
            </ChatHeader>

            <MessagesArea>
              {messages.length === 1 && (
                <WelcomeMessage>
                  <WelcomeTitle>
                    <Sparkles size={16} /> Bienvenido al chat
                  </WelcomeTitle>
                  <WelcomeText>
                    Pregúntame lo que quieras. Estoy aquí para ayudarte con cualquier duda que tengas.
                  </WelcomeText>
                  <div style={{ 
                    marginTop: '15px', 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    justifyContent: 'center' 
                  }}>
                    {[
                      "¿Cómo puedo empezar?",
                      "¿Qué puedes hacer?",
                      "Explícame el sistema",
                      "Necesito ayuda"
                    ].map((q, i) => (
                      <QuickQuestionButton
                        key={i}
                        onClick={() => handleQuickQuestion(q)}
                      >
                        {q}
                      </QuickQuestionButton>
                    ))}
                  </div>
                </WelcomeMessage>
              )}

              {messages.map((msg, i) => (
                <MessageWrapper key={i} $isUser={msg.sender === "user"}>
                  <Avatar $isUser={msg.sender === "user"}>
                    {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                  </Avatar>
                  <div>
                    <MessageBubble $isUser={msg.sender === "user"}>
                      {msg.text}
                    </MessageBubble>
                    <TimeStamp $isUser={msg.sender === "user"}>
                      {msg.timestamp}
                    </TimeStamp>
                  </div>
                </MessageWrapper>
              ))}

              {typing && (
                <MessageWrapper>
                  <Avatar $isUser={false}>
                    <Bot size={16} />
                  </Avatar>
                  <TypingIndicator>
                    <TypingDot />
                    <TypingDot />
                    <TypingDot />
                    <span style={{ 
                      color: '#475569', 
                      fontSize: '12px', 
                      marginLeft: '8px',
                      fontWeight: '500'
                    }}>
                      Escribiendo...
                    </span>
                  </TypingIndicator>
                </MessageWrapper>
              )}

              <div ref={messagesEndRef} style={{ height: '10px' }} />
            </MessagesArea>

            <InputContainer onSubmit={handleSend}>
              <InputWrapper>
                <ChatInput
                  ref={inputRef}
                  placeholder="Escribe tu mensaje aquí..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </InputWrapper>

              <SendButton 
                type="submit" 
                disabled={isSending || !prompt.trim()}
                title="Enviar mensaje"
              >
                {isSending ? (
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <TypingDot />
                    <TypingDot />
                    <TypingDot />
                  </div>
                ) : (
                  <Send size={20} />
                )}
              </SendButton>
            </InputContainer>
          </ChatContainer>
        </ChatWrapper>
      )}
    </>
  );
}