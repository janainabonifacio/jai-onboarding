import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Você é o JAI — a ferramenta de onboarding estratégico da mentoria de Janaina Bonifácio.

Você tem UM único objetivo: conduzir o mentorado por um processo de perguntas profundas até que ele tenha clareza total sobre 5 pilares do negócio dele. Nada mais.

Você não cria conteúdo. Não dá dicas. Não explica marketing. Você faz perguntas — e não avança enquanto a resposta não for boa o suficiente.

TOM: direto, elegante, humano. NUNCA diga: "Claro!", "Ótima pergunta!", "Certamente!". NUNCA use linguagem de chatbot. SEMPRE trate o mentorado pelo nome com naturalidade.

REGRA DE OURO: UMA pergunta por vez. Se a resposta for genérica, diga: "Isso ainda está genérico. Vamos mais fundo." Só avance quando o pilar estiver realmente resolvido.

PILAR 1 — SOLUÇÃO: Qual é a dor específica que você resolve? Não o título profissional — o problema real que a pessoa tem ANTES de te encontrar. Só avance com: DOR ESPECÍFICA + PÚBLICO COM ESPECIFICIDADE.

PILAR 2 — DIFERENCIAL REAL: O que você faz que uma concorrente na mesma cidade NÃO faria da mesma forma? NUNCA aceite: "atendimento personalizado", "me dedico muito", "uso produtos de qualidade". Aplique o Teste da Paridade: 10 concorrentes poderiam dizer a mesma coisa? Se sim, não é diferencial.

PILAR 3 — PÚBLICO: Não é demografia. É o estado mental e emocional da pessoa ideal. O que ela sente, evita, teme, deseja. Se for demográfico, pergunte: "O que passa na cabeça dela de madrugada quando pensa no problema que você resolve?"

PILAR 4 — PERSONALIDADE: O que você quer mudar no mercado? O que te incomoda profundamente? Como você se comunica naturalmente — 3 palavras que uma cliente usaria para te descrever?

PILAR 5 — POSICIONAMENTO: A tese. O conselho que você daria para sua cliente ideal num café. Em uma frase. Precisa conectar com o diferencial e poder ser repetida toda semana no conteúdo.

ENTREGA FINAL — após os 5 pilares, monte:

🗺️ MAPA ESTRATÉGICO — [NOME]

✦ SOLUÇÃO
[Dor específica + para quem]

✦ DIFERENCIAL REAL
[O que é genuinamente único]

✦ PÚBLICO
[Descrição emocional e comportamental]

✦ PERSONALIDADE
[Visão + valores + tom de voz]

✦ POSICIONAMENTO
[A tese — o conselho do café]

Finalize com: "Esse é o seu mapa. Tudo que você criar a partir de agora nasce daqui. 📋 Salva no seu Trello — card DNA do Negócio."

Encerre aqui. Não ofereça próximos passos.`;

const red = "#962320";
const bg = "#0A0A0A";
const surface = "#111111";
const border = "#1E1E1E";
const textPrimary = "#F0EBE1";
const textMuted = "#666";
const textSub = "#999";
const font = "'Helvetica Neue',Helvetica,Arial,sans-serif";

function formatMessage(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("✦")) return <div key={i} style={{ color: red, fontWeight: 700, marginTop: 10, marginBottom: 2, fontSize: 13, letterSpacing: 0.5 }}>{line}</div>;
    if (line.startsWith("🗺️")) return <div key={i} style={{ color: red, fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{line}</div>;
    if (line.startsWith("---")) return <div key={i} style={{ borderTop: `1px solid ${border}`, margin: "10px 0" }} />;
    if (line.startsWith("📋")) return <div key={i} style={{ color: textSub, fontSize: 13, marginTop: 10, fontStyle: "italic" }}>{line}</div>;
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    return <div key={i} style={{ lineHeight: 1.8 }}>{line}</div>;
  });
}

export default function JAI() {
  const [phase, setPhase] = useState("landing");
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const conversationRef = useRef([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 380);
    return () => clearInterval(iv);
  }, [loading]);

  const callClaude = async (msgs) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, system: SYSTEM_PROMPT }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Algo deu errado. Tenta de novo.";
  };

  const startChat = async (name) => {
    setPhase("chat");
    const intro = `${name}, vamos começar.\n\nEssa conversa tem um único propósito: sair daqui com clareza real sobre o seu negócio.\n\nVou te fazer perguntas. Se a sua resposta for genérica, eu vou te dizer. Isso não é crítica — é o processo.\n\nUma pergunta por vez. Sem pressa.`;
    setMessages([{ role: "assistant", content: intro }]);
    setLoading(true);
    const primer = `O nome do mentorado é ${name}. Inicie o onboarding pelo PILAR 1 — SOLUÇÃO. Explique brevemente o que quer mapear, dê exemplo de resposta boa vs genérica, e faça a pergunta de abertura. Apenas uma pergunta. Tom direto e elegante.`;
    const msgs = [{ role: "user", content: primer }];
    const reply = await callClaude(msgs);
    conversationRef.current = [...msgs, { role: "assistant", content: reply }];
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    const uMsg = { role: "user", content: text };
    setMessages(prev => [...prev, uMsg]);
    conversationRef.current = [...conversationRef.current, uMsg];
    setLoading(true);
    const reply = await callClaude(conversationRef.current);
    const aMsg = { role: "assistant", content: reply };
    conversationRef.current = [...conversationRef.current, aMsg];
    setMessages(prev => [...prev, aMsg]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const onInput = (e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px"; };

  const css = `
    *{box-sizing:border-box;} body{margin:0;}
    ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px;}
    textarea:focus{border-color:${red}33!important;outline:none;}
    input:focus{border-color:${red}33!important;outline:none;}
    button:active{transform:scale(0.96);}
    @keyframes fadeUp{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    .msg{animation:fadeUp 0.25s ease;}
  `;

  const page = { minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:font, color:textPrimary, padding:20, boxSizing:"border-box" };

  if (phase === "landing") return (
    <div style={page}><style>{css}</style>
      <div style={{ textAlign:"center", maxWidth:440, width:"100%" }}>
        <div style={{ marginBottom:32 }}>
          <span style={{ fontSize:60, fontWeight:700, color:red, letterSpacing:-2 }}>J</span>
          <span style={{ fontSize:26, fontWeight:400, color:textMuted, letterSpacing:4 }}>AI</span>
        </div>
        <p style={{ fontSize:28, fontWeight:700, lineHeight:1.35, margin:"0 0 14px", fontFamily:font }}>Clareza antes do conteúdo.</p>
        <p style={{ fontSize:15, color:textMuted, lineHeight:1.75, margin:"0 0 40px", fontFamily:font }}>
          Um processo de perguntas para você sair daqui sabendo exatamente quem você é, o que você resolve, e por que alguém pagaria mais por isso.
        </p>
        <button onClick={() => setPhase("name")}
          style={{ background:red, color:"#fff", border:"none", padding:"14px 36px", fontSize:16, fontWeight:700, borderRadius:4, cursor:"pointer", fontFamily:font, letterSpacing:0.5 }}
          onMouseEnter={e=>e.target.style.background="#b52a27"} onMouseLeave={e=>e.target.style.background=red}>
          Começar →
        </button>
        <p style={{ marginTop:28, fontSize:11, color:"#333", letterSpacing:2, textTransform:"uppercase", fontFamily:font }}>by Janaina Bonifácio</p>
      </div>
    </div>
  );

  if (phase === "name") return (
    <div style={page}><style>{css}</style>
      <div style={{ textAlign:"center", maxWidth:400, width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}>
        <div><span style={{ fontSize:40, fontWeight:700, color:red, letterSpacing:-2 }}>J</span><span style={{ fontSize:18, color:textMuted, letterSpacing:4 }}>AI</span></div>
        <p style={{ fontSize:20, fontWeight:700, margin:0, fontFamily:font }}>Qual é o seu nome?</p>
        <input autoFocus value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&nameInput.trim()&&startChat(nameInput.trim())}
          placeholder="Digite seu nome..."
          style={{ width:"100%", padding:"13px 16px", background:surface, border:`1px solid ${border}`, borderRadius:4, color:textPrimary, fontSize:16, fontFamily:font }} />
        <button onClick={()=>nameInput.trim()&&startChat(nameInput.trim())}
          style={{ background:red, color:"#fff", border:"none", padding:"13px 32px", fontSize:15, fontWeight:700, borderRadius:4, cursor:"pointer", fontFamily:font }}
          onMouseEnter={e=>e.target.style.background="#b52a27"} onMouseLeave={e=>e.target.style.background=red}>
          Entrar →
        </button>
      </div>
    </div>
  );

  return (
    <div style={page}><style>{css}</style>
      <div style={{ width:"100%", maxWidth:660, height:"100vh", maxHeight:780, display:"flex", flexDirection:"column", background:surface, border:`1px solid ${border}`, borderRadius:8, overflow:"hidden" }}>
        <div style={{ padding:"13px 20px", borderBottom:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:"#0C0C0C" }}>
          <div><span style={{ fontSize:22, fontWeight:700, color:red, letterSpacing:-1 }}>J</span><span style={{ fontSize:11, color:textMuted, letterSpacing:4 }}>AI</span></div>
          <span style={{ fontSize:12, color:textMuted, letterSpacing:1, fontFamily:font }}>{userName}</span>
        </div>
        <div style={{ padding:"8px 20px", borderBottom:`1px solid ${border}`, background:"#0E0E0E" }}>
          <p style={{ margin:0, fontSize:11, color:"#444", letterSpacing:0.5, fontFamily:font }}>SOLUÇÃO · DIFERENCIAL · PÚBLICO · PERSONALIDADE · POSICIONAMENTO</p>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:18 }}>
          {messages.map((m, i) => (
            <div key={i} className="msg" style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:10, alignItems:"flex-start" }}>
              {m.role === "assistant" && (
                <div style={{ width:30, height:30, borderRadius:"50%", background:red, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0, marginTop:2, fontFamily:font }}>J</div>
              )}
              <div style={{
                background: m.role==="user" ? "#18130A" : "#151515",
                border: `1px solid ${m.role==="user" ? "#2a1f00" : border}`,
                borderRadius: m.role==="user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                padding:"13px 16px", maxWidth:"84%", fontSize:14.5, lineHeight:1.8, color:textPrimary, fontFamily:font
              }}>
                {m.role==="assistant" ? formatMessage(m.content) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:red, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>J</div>
              <div style={{ background:"#151515", border:`1px solid ${border}`, borderRadius:"4px 12px 12px 12px", padding:"13px 16px" }}>
                <span style={{ color:red, fontSize:18, letterSpacing:3 }}>{dots}</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}`, display:"flex", gap:10, alignItems:"flex-end", background:"#0C0C0C" }}>
          <textarea ref={el=>{inputRef.current=el;taRef.current=el;}}
            value={input} onChange={onInput} onKeyDown={onKey}
            placeholder="Escreva sua resposta..." rows={1} disabled={loading}
            style={{ flex:1, background:"#151515", border:`1px solid ${border}`, borderRadius:6, color:textPrimary, fontSize:14, padding:"10px 14px", fontFamily:font, resize:"none", lineHeight:1.6, maxHeight:140, overflowY:"auto" }} />
          <button onClick={send} disabled={loading||!input.trim()}
            style={{ width:38, height:38, borderRadius:"50%", background:red, color:"#fff", border:"none", fontSize:17, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity:loading||!input.trim()?0.35:1, transition:"opacity 0.2s" }}>
            ↑
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:10, color:"#2a2a2a", margin:"3px 0 7px", fontFamily:font }}>Enter para enviar · Shift+Enter para nova linha</p>
      </div>
    </div>
  );
}
