<div class="inner">
    <div class="above">
        <abbr title="{{=it.name}}" class="symbol">{{=it.symbol}}</abbr>
        <div class="details">
            <div class="line">
                <div>Atomic Number</div>
                <div>{{=it.number}}</div>
            </div>
            <div class="line">
                <div>Atomic Mass</div>
                <div>{{=it.mass}}</div>
            </div>   
        </div>
    </div>
    {{?it.mag.type}}
    <div class="magnetic-response">

        {{?it.mag.type !== "dia"}}
            {{?it.mag.Tc}}
            <abbr title="ferromagnetic" class="ferro">ferro</abbr>
            <data class="curie-point" value="{{=it.mag.Tc}}">{{=it.mag.Tc}}K</data>
            {{?}}
            {{?it.mag.Tn}}
            <abbr title="antiferromagnetic" class="anti">anti</abbr>
            <data class="neel-point" value="{{=it.mag.Tn}}">{{=it.mag.Tn}}K</data>
            {{?}}
            <abbr title="paramagnetic" class="para">para</abbr>
        {{?}}

        {{?it.mag.type === "dia"}}
            <abbr title="diamagnetic" class="dia">dia</abbr>
        {{?}}

    </div>
    {{?}}     
</div>