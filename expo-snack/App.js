import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from "react-native";

// Substitua pela URL real do seu serviço no Render, sem /clientes no final.
const API_URL = "https://SUA-API.onrender.com";

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true); setErro("");
    try {
      const r = await fetch(`${API_URL}/clientes`);
      if (!r.ok) throw new Error("Falha ao consultar a API");
      setClientes(await r.json());
    } catch (e) {
      setErro("Confira se você colocou a URL correta do Render no código.");
    } finally { setLoading(false); }
  }
  useEffect(() => { carregar(); }, []);

  function limpar() { setNome(""); setEmail(""); setEditando(null); }

  async function salvar() {
    if (!nome.trim() || !email.trim()) return Alert.alert("Atenção", "Preencha nome e e-mail.");
    try {
      const alterando = editando !== null;
      const r = await fetch(alterando ? `${API_URL}/clientes/${editando}` : `${API_URL}/clientes`, {
        method: alterando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim() })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || "Não foi possível salvar.");
      limpar(); await carregar();
      Alert.alert("Pronto!", alterando ? "Cliente alterado." : "Cliente cadastrado.");
    } catch (e) { Alert.alert("Erro", e.message || "Não foi possível conectar à API."); }
  }

  function excluir(cliente) {
    Alert.alert("Excluir cliente", `Deseja excluir ${cliente.nome}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          const r = await fetch(`${API_URL}/clientes/${cliente.id}`, { method: "DELETE" });
          const data = await r.json();
          if (!r.ok) throw new Error(data.erro || "Falha ao excluir.");
          if (editando === cliente.id) limpar();
          await carregar();
        } catch (e) { Alert.alert("Erro", e.message); }
      }}
    ]);
  }

  function card({ item }) {
    return <View style={s.card}>
      <View style={s.avatar}><Text style={s.avatarText}>{item.nome.slice(0,1).toUpperCase()}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.nome}</Text><Text style={s.email}>{item.email}</Text><Text style={s.id}>ID #{item.id}</Text>
      </View>
      <View style={s.actions}>
        <TouchableOpacity style={s.edit} onPress={() => { setEditando(item.id); setNome(item.nome); setEmail(item.email); }}><Text style={s.editText}>Editar</Text></TouchableOpacity>
        <TouchableOpacity style={s.delete} onPress={() => excluir(item)}><Text style={s.deleteText}>Excluir</Text></TouchableOpacity>
      </View>
    </View>;
  }

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFF7FA" />
    <FlatList
      data={clientes} keyExtractor={item => String(item.id)} renderItem={card}
      refreshing={loading} onRefresh={carregar} contentContainerStyle={s.content}
      ListHeaderComponent={<>
        <View style={s.header}><View style={s.logo}><Text style={s.logoText}>C</Text></View><View><Text style={s.title}>Central de Clientes</Text><Text style={s.subtitle}>Gerencie seus cadastros ♡</Text></View></View>
        <View style={s.summary}><Text style={s.summaryLabel}>TOTAL DE CLIENTES</Text><Text style={s.summaryNumber}>{clientes.length}</Text></View>
        <View style={s.form}>
          <Text style={s.sectionTitle}>{editando === null ? "Novo cliente" : `Editar cliente #${editando}`}</Text>
          <Text style={s.label}>Nome *</Text><TextInput style={s.input} value={nome} onChangeText={setNome} placeholder="Ex.: Ana Costa" placeholderTextColor="#C6A6B4" />
          <Text style={s.label}>E-mail *</Text><TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="ana@email.com" placeholderTextColor="#C6A6B4" keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={s.primary} onPress={salvar}><Text style={s.primaryText}>{editando === null ? "+  Cadastrar cliente" : "Salvar alterações  ↗"}</Text></TouchableOpacity>
          {editando !== null && <TouchableOpacity onPress={limpar} style={s.cancel}><Text style={s.cancelText}>Cancelar edição</Text></TouchableOpacity>}
        </View>
        <View style={s.listHead}><View><Text style={s.sectionTitle}>Clientes cadastrados</Text><Text style={s.subtitle}>Dados recebidos da API REST</Text></View><View style={s.count}><Text style={s.countText}>{clientes.length}</Text></View></View>
        {loading && clientes.length === 0 ? <ActivityIndicator color="#D8799C" style={{ margin: 20 }} /> : null}
        {erro ? <Text style={s.error}>{erro}</Text> : null}
      </>}
      ListEmptyComponent={!loading && !erro ? <Text style={s.empty}>Nenhum cliente cadastrado ainda.</Text> : null}
      ListFooterComponent={<TouchableOpacity style={s.refresh} onPress={carregar}><Text style={s.refreshText}>↻  Atualizar lista</Text></TouchableOpacity>}
    />
  </SafeAreaView>;
}
const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#FFF7FA"},content:{padding:18,paddingBottom:30},
  header:{flexDirection:"row",alignItems:"center",marginBottom:20,gap:12},
  logo:{width:45,height:45,borderRadius:14,backgroundColor:"#E99AB6",alignItems:"center",justifyContent:"center"},
  logoText:{color:"#fff",fontSize:22,fontWeight:"900"},title:{fontSize:22,fontWeight:"900",color:"#573747"},subtitle:{fontSize:12,color:"#A08391",marginTop:4},
  summary:{backgroundColor:"#F5C7D8",borderRadius:17,padding:18,marginBottom:18},
  summaryLabel:{fontSize:10,fontWeight:"900",letterSpacing:1,color:"#8F536C"},summaryNumber:{fontSize:32,fontWeight:"900",color:"#704257",marginTop:4},
  form:{backgroundColor:"#fff",borderRadius:18,padding:18,borderWidth:1,borderColor:"#F3DFE7",marginBottom:24},
  sectionTitle:{fontSize:18,fontWeight:"900",color:"#573747"},label:{fontSize:12,fontWeight:"800",color:"#80586B",marginTop:15,marginBottom:7},
  input:{backgroundColor:"#FFFAFC",borderWidth:1,borderColor:"#F0DCE5",borderRadius:10,padding:12,color:"#573747"},
  primary:{backgroundColor:"#E58EAD",borderRadius:10,padding:14,alignItems:"center",marginTop:18},
  primaryText:{color:"#fff",fontWeight:"900",fontSize:14},cancel:{alignItems:"center",padding:12},cancelText:{color:"#A45D7B",fontWeight:"700"},
  listHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:13},
  count:{backgroundColor:"#FBE4ED",borderRadius:9,minWidth:30,padding:8,alignItems:"center"},countText:{color:"#BD6488",fontWeight:"900"},
  card:{backgroundColor:"#fff",borderRadius:14,padding:13,marginBottom:10,borderWidth:1,borderColor:"#F3DFE7",flexDirection:"row",alignItems:"center",gap:10},
  avatar:{width:40,height:40,borderRadius:13,backgroundColor:"#FBE4ED",alignItems:"center",justifyContent:"center"},avatarText:{color:"#B85E81",fontWeight:"900",fontSize:17},
  name:{fontSize:14,fontWeight:"900",color:"#573747"},email:{fontSize:11,color:"#9A7A89",marginTop:4},id:{fontSize:10,color:"#B49BA7",marginTop:4},
  actions:{gap:6},edit:{backgroundColor:"#FFF0F5",paddingVertical:6,paddingHorizontal:8,borderRadius:7},editText:{fontSize:10,fontWeight:"800",color:"#B85E81"},
  delete:{backgroundColor:"#FFF4F4",paddingVertical:6,paddingHorizontal:8,borderRadius:7},deleteText:{fontSize:10,fontWeight:"800",color:"#C65D72"},
  empty:{textAlign:"center",padding:25,color:"#A08391",backgroundColor:"#fff",borderRadius:13},
  error:{color:"#C14E70",padding:12},refresh:{borderWidth:1,borderColor:"#EBC7D6",backgroundColor:"#fff",borderRadius:11,padding:13,alignItems:"center",marginTop:8},refreshText:{color:"#B85E81",fontWeight:"900"}
});
